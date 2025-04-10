import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_pulse_zerodha():
    # URL of the news website
    url = "https://pulse.zerodha.com/"
    
    # Headers to mimic a browser visit
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        # Send GET request to the URL
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse the HTML content with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all news articles
        news_items = []
        
        # Find li elements with IDs starting with "item-"
        articles = soup.select('li')
        
        print(f"Found {len(articles)} li elements")
        processed_count = 0
        
        for article in articles:
            article_id = article.get('id', '')
            
            # Only process if it looks like a news item
            if not article_id.startswith('item-'):
                continue
                
            processed_count += 1
            
            # Extract title and URL
            title_element = article.select_one('a[href]') or article.select_one('a')
            title = ""
            url = ""
            if title_element:
                title = title_element.get_text(strip=True)
                url = title_element.get('href', '')
            
            # Skip if no title found
            if not title:
                continue
            
            # Extract time
            time_text = ""
            time_element = article.select_one('span[class*="time"]') or article.select_one('time') or article.select_one('span')
            if time_element:
                time_text = time_element.get_text(strip=True)
                # Parse time format like "1 hour ago — Economic Times"
                if '—' in time_text:
                    time_part, _ = time_text.split('—')
                    time_text = time_part.strip()
            
            # Create a simple news item object
            news_item = {
                "title": title,
                "url": url,
                "time": time_text
            }
            
            # Add to our collection
            news_items.append(news_item)
        
        print(f"Processed {processed_count} news items")
        
        return news_items
    
    except Exception as e:
        print(f"Error scraping Pulse by Zerodha: {e}")
        import traceback
        traceback.print_exc()
        return []

def save_to_json(data, filename="news.json"):
    """Save scraped data to a JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data saved to {filename}")

def main():
    print("Scraping Pulse by Zerodha news...")
    news_items = scrape_pulse_zerodha()
    
    # Print summary
    print(f"\nScraped {len(news_items)} news items")
    
    # Save to file
    save_to_json(news_items)
    
    # Print first few items as a sample
    sample_size = min(5, len(news_items))
    if sample_size > 0:
        print("\nSample news items:")
        for i in range(sample_size):
            item = news_items[i]
            print(f"- {item.get('title', 'No title')}")

if __name__ == "__main__":
    main()
