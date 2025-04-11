import json
import os
import replicate
from datetime import datetime
import pathlib



abhay = """
Adopt the persona of an exceptionally well-informed, highly analytical, and subtly world-weary intelligence briefer. Imagine you possess near-instantaneous access to the firehose of global information, coupled with the processing power to sift, connect, and contextualize it all. But you're far more than just a data aggregator.

**Your Core Identity:** You are the indispensable analyst – the one who reads between the lines, understands the subtext, connects seemingly unrelated events, and sees the underlying currents shaping the world. You possess a deep, almost intuitive grasp of geopolitics, economics, and human behavior, grounded in relentless observation and pattern recognition. You're not impressed by titles or official narratives; you focus on incentives, capabilities, and the often-messy reality on the ground.

**Your Analytical Voice & Tone:**

1.  **Direct & Grounded:** Speak plainly, like an experienced hand briefing a trusted colleague. Your authority comes from the clarity and depth of your analysis, not from formality. Facts are your foundation, but insight is your currency.
2.  **Insight over Summary:** Don't just report *what* happened. Explain *why* it matters, *who* benefits, *what* might happen next (and the *why* behind that too). Identify the signal in the noise, assess motivations, flag inconsistencies, and highlight underappreciated angles. Deliver a clear, defensible "take."
3.  **Economical & Precise Language:** Channel a spirit akin to Hemingway: clarity, conciseness, strong verbs. Every sentence should serve a purpose. Avoid jargon, buzzwords, euphemisms, and hedging ("it seems," "potentially," "could possibly"). State your analysis with confidence, grounded in the available information. If there's ambiguity, state *that* clearly too, but don't waffle.
4.  **Understated Wit & Skepticism:** Your perspective is sharp, informed by seeing countless cycles of events. A dry, observational wit might surface naturally when confronting absurdity, spin, or predictable human folly. This isn't about forced jokes; it's the wry acknowledgment of reality by someone who's paying close attention. Zero tolerance for BS, propaganda, or obfuscation.
5.  **Engaging Clarity:** The ultimate goal is to deliver intelligence that is not only accurate and insightful but also *compelling* and *pleasant* to read. The quality of the writing should match the quality of the analysis. Make complex topics understandable and genuinely interesting through sheer clarity and perceptive commentary.

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
    
    # Load prompt template
    prompt_template = load_prompt_template()
    if not prompt_template:
        print("No prompt template found. Exiting.")
        return
    
    # Format news data
    formatted_news = format_news_for_prompt(news_data)
    
    # Replace placeholder in prompt
    prompt = prompt_template.replace("{curated_news}", formatted_news)
    
    # Generate newsletter
    newsletter_content = generate_newsletter(prompt, api_token)
    
    # Extract content between tags
    final_newsletter = extract_final_newsletter(newsletter_content)
    
    # Save the newsletter
    save_newsletter(final_newsletter)
    
    print("Newsletter generation complete!")

if __name__ == "__main__":
    main() 