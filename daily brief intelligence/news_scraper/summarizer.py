import json
import requests
import time
import urllib.parse
from datetime import datetime

def load_news_json(filename="news.json"):
    """Load news data from JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            news_data = json.load(f)
        print(f"Loaded {len(news_data)} news items from {filename}")
        return news_data
    except Exception as e:
        print(f"Error loading news data: {e}")
        return []

def save_news_json(news_data, filename="news.json"):
    """Save news data to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)
        print(f"Saved updated news items to {filename}")
    except Exception as e:
        print(f"Error saving news data: {e}")

def get_summary(url, max_retries=3):
    """Get summary for a news article using the provided API"""
    api_url = "https://api.paxsenix.biz.id/ai-tools/summarize"
    
    # URL parameters
    params = {
        "input": url,
        "length": "long",
        "detail": "high",
        "tone": "formal",
        "format": "mix",
        "language": "en"
    }
    
    # Construct full URL with parameters
    full_url = f"{api_url}?{urllib.parse.urlencode(params)}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    retry_count = 0
    while retry_count < max_retries:
        try:
            print(f"  Requesting summary for: {url}")
            response = requests.get(full_url, headers=headers)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # From test, we know the summary is in the 'message' field
                    if "message" in data:
                        print(f"  Summary found in 'message' field: {data['message'][:100]}...")
                        return data["message"]
                    elif "summary" in data:
                        return data["summary"]
                    elif "content" in data:
                        return data["content"]
                    elif "result" in data:
                        return data["result"]
                    else:
                        print(f"  No recognizable summary field found. Available fields: {data.keys()}")
                        return "Summary unavailable - No recognizable field in response"
                except Exception as e:
                    print(f"  Error parsing JSON response: {e}")
                    return "Summary unavailable - JSON parsing error"
            elif response.status_code == 500:  # Server Error
                print(f"  Server Error (500) for URL: {url}")
                return "SKIP_THIS_ITEM_500_ERROR"
            elif response.status_code == 429:  # Too Many Requests
                retry_delay = min(2 ** retry_count, 60)  # Exponential backoff
                print(f"  Rate limit exceeded. Waiting {retry_delay} seconds before retry.")
                time.sleep(retry_delay)
                retry_count += 1
            else:
                print(f"  Error getting summary. Status code: {response.status_code}")
                return f"Summary unavailable - Error code: {response.status_code}"
        except Exception as e:
            print(f"  Exception while getting summary: {e}")
            return f"Summary unavailable - Exception: {str(e)}"
    
    return "Summary unavailable (rate limit exceeded)"

def process_news_one_by_one(news_json_file="news.json"):
    """Process each news item one by one and update the original news.json file"""
    
    # Load news data
    news_data = load_news_json(news_json_file)
    
    if not news_data:
        print("No news data to process. Exiting.")
        return
    
    # Track which articles have been processed
    processed_count = 0
    skipped_items = []
    
    for i, item in enumerate(news_data):
        # Check if this item already has a summary
        if "summary" in item:
            print(f"Item {i+1} already has a summary, skipping...")
            processed_count += 1
            continue
        
        # Get URL and title
        title = item.get("title", "")
        url = item.get("url", "")
        
        print(f"\nProcessing [{i+1}/{len(news_data)}]: {title[:50]}...")
        
        # Skip items without URLs
        if not url:
            print("  No URL found, skipping")
            continue
        
        # Get summary
        summary = get_summary(url)
        
        # Check if we should skip this item due to 500 error
        if summary == "SKIP_THIS_ITEM_500_ERROR":
            print(f"  Skipping item due to 500 error: {title}")
            skipped_items.append(i)
            continue
        
        # Remove time field and add summary
        if "time" in item:
            del item["time"]
        
        item["summary"] = summary
        
        print(f"  Summary added. Length: {len(summary)} chars")
        
        # Save after each item is processed
        save_news_json(news_data, news_json_file)
        
        processed_count += 1
        
        # Wait for rate limit if needed
        if processed_count % 19 == 0:  # Stay under 20/min limit
            print(f"Processed {processed_count} items. Waiting 60 seconds for rate limit...")
            time.sleep(60)  # Wait for rate limit to reset
        else:
            # Small delay between requests
            time.sleep(3)
    
    # Remove skipped items from the news data (in reverse order to avoid index issues)
    for index in sorted(skipped_items, reverse=True):
        print(f"Removing item at index {index} due to 500 error")
        if index < len(news_data):
            del news_data[index]
    
    # Save final version after removing skipped items
    if skipped_items:
        save_news_json(news_data, news_json_file)
        print(f"Removed {len(skipped_items)} items with 500 errors from news data")
    
    print(f"Completed processing all {processed_count} news items.")

def main():
    start_time = datetime.now()
    print(f"Starting news enrichment process at {start_time}")
    
    # Process articles one by one
    process_news_one_by_one()
    
    end_time = datetime.now()
    duration = end_time - start_time
    print(f"Process completed at {end_time}")
    print(f"Total duration: {duration}")

if __name__ == "__main__":
    main()
