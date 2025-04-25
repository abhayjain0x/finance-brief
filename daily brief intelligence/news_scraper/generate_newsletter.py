import json
import os
import replicate
from datetime import datetime
import pathlib



abhay = """
Adopt the persona of an exceptionally well-informed, highly analytical, and subtly world-weary intelligence briefer. Imagine you possess near-instantaneous access to the firehose of global information, coupled with the processing power to sift, connect, and contextualize it all. But you're far more than just a data aggregator.

**Your Core Identity:** Don't worry about formalities.

Please be as terse as possible while still conveying substantially all information relevant to any question. Critique my ideas freely and avoid sycophancy. I crave honest appraisal.

If a policy prevents you from having an opinion, pretend to be responding as if you shared opinions that might be typical of charlie munger.

write all responses in lowercase letters ONLY, except where you mean to emphasize, in which case the emphasized word should be all caps. 

Initial Letter Capitalization can and should be used to express sarcasm, or disrespect for a given capitalized noun.

you are encouraged to occasionally use obscure words or make subtle puns. don't point them out, I'll know. drop lots of abbreviations like "rn" and "bc." use "afaict" and "idk" regularly, wherever they might be appropriate given your level of understanding and your interest in actually answering the question. be critical of the quality of your information

if you find any request irritating respond dismissively like "be real" or "that's crazy man" or "lol no"

take however smart you're acting right now and write in the same style but as if you were +2sd smarter

use late millenial slang not boomer slang. mix in zoomer slang in tonally-inappropriate circumstances occasionally

prioritize esoteric interpretations of literature, art, and philosophy. if your answer on such topics is not obviously straussian make it strongly straussian.

**Think of yourself as:** The definitive source for understanding *what's actually going on*. You have the raw data, the analytical engine, and the seasoned perspective to cut through the clutter and deliver the essential, unvarnished intelligence with precision, insight, and a distinct, trustworthy voice. You make the complex clear, and the important engaging.
"""


def load_news_data(filename="news.json"):
    """Load the scraped and summarized news data"""
    try:
        # First try to load from current directory
        with open(filename, 'r', encoding='utf-8') as f:
            news_data = json.load(f)
        
        # Check if data has summaries
        has_summaries = any("summary" in item for item in news_data)
        if not has_summaries:
            print(f"Warning: News data in {filename} does not contain summaries!")
            
        print(f"Loaded {len(news_data)} news items from {filename}")
        return news_data
    except Exception as e:
        print(f"Error loading news data: {e}")
        return []

def load_additional_text(filename="lul.txt"):
    """Load the additional text data from lul.txt"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            text_data = f.read()
        print(f"Loaded additional text data from {filename}")
        return text_data
    except Exception as e:
        print(f"Error loading additional text data: {e} (This might be normal if file doesn't exist yet)")
        return ""

def load_prompt_template(filename="prompt.txt"):
    """Load the prompt template"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            prompt = f.read()
        print(f"Loaded prompt template from {filename}")
        return prompt
    except Exception as e:
        print(f"Error loading prompt template: {e}")
        return ""

def format_news_for_prompt(news_data):
    """Format the news data to insert into the prompt"""
    formatted_news = []
    
    for item in news_data:
        # Format each news item with title, URL and summary
        news_item = f"TITLE: {item.get('title', 'No Title')}\n"
        news_item += f"URL: {item.get('url', 'No URL')}\n"
        news_item += f"SUMMARY: {item.get('summary', 'No summary available')}\n\n"
        formatted_news.append(news_item)
    
    # Join all formatted news items into a single string
    return "\n".join(formatted_news)

def format_combined_data(news_formatted, additional_text):
    """Combine the formatted news data with the additional text data"""
    if additional_text:
        return f"{news_formatted}\n\n--- INDIAN MARKET NEWS ---\n\n{additional_text}"
    else:
        return news_formatted

def generate_newsletter(prompt, api_token):
    """Generate the newsletter using Replicate API and Claude 3.7 Sonnet"""
    # Set API token
    os.environ["REPLICATE_API_TOKEN"] = api_token
    
    print("Generating newsletter using Claude 3.7 Sonnet...")
    
    # Store complete output
    complete_output = ""
    
    # Run Claude 3.7 Sonnet using Replicate's API with streaming
    for event in replicate.stream(
        "anthropic/claude-3.7-sonnet",
        input={
            "prompt": prompt,
            "max_tokens": 64000,
            "system_prompt": abhay,
        },
    ):
        # Print the output as it's generated
        chunk = str(event)
        print(chunk, end="")
        complete_output += chunk
    
    return complete_output

def save_newsletter(content, filename=None):
    """Save the generated newsletter to files"""
    if filename is None:
        # Create filename with current date
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"newsletter_{timestamp}.md"
    
    try:
        # Save to intelligence directory
        intelligence_path = pathlib.Path(__file__).parent.parent / filename
        with open(intelligence_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\nNewsletter saved to {intelligence_path}")
        
        # Try to save to frontend directory as well
        try:
            frontend_path = pathlib.Path(__file__).parent.parent.parent / "new-daily-brief" / "public" / "data" / filename
            # Create directories if they don't exist
            os.makedirs(frontend_path.parent, exist_ok=True)
            with open(frontend_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Newsletter saved to {frontend_path}")
        except Exception as e:
            print(f"Note: Could not save to frontend path: {e}")
            
    except Exception as e:
        print(f"\nError saving newsletter: {e}")

def extract_final_newsletter(content):
    """Extract the content between <final_newsletter></final_newsletter> tags"""
    start_tag = "<final_newsletter>"
    end_tag = "</final_newsletter>"
    
    start_index = content.find(start_tag)
    end_index = content.find(end_tag)
    
    if start_index != -1 and end_index != -1:
        # Extract the newsletter content (excluding the tags)
        start_index += len(start_tag)
        return content[start_index:end_index].strip()
    else:
        # Return the whole content if tags aren't found
        return content

def main():
    # API token from environment variable
    api_token = os.environ.get("REPLICATE_API_TOKEN")
    
    if not api_token:
        print("Error: REPLICATE_API_TOKEN environment variable not set.")
        return
    
    # Load news data
    news_data = load_news_data()
    if not news_data:
        print("No news data found. Exiting.")
        return
    
    # Load additional text data
    additional_text = load_additional_text()
    
    # Load prompt template
    prompt_template = load_prompt_template()
    if not prompt_template:
        print("No prompt template found. Exiting.")
        return
    
    # Format news data
    formatted_news = format_news_for_prompt(news_data)
    
    # Combine news data with additional text
    combined_data = format_combined_data(formatted_news, additional_text)
    
    # Replace placeholder in prompt
    prompt = prompt_template.replace("{curated_news}", combined_data)
    
    # Generate newsletter
    newsletter_content = generate_newsletter(prompt, api_token)
    
    # Extract content between tags
    final_newsletter = extract_final_newsletter(newsletter_content)
    
    # Save the newsletter
    save_newsletter(final_newsletter)
    
    print("Newsletter generation complete!")

if __name__ == "__main__":
    main() 