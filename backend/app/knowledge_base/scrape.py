import os
import re
import requests
import time
from bs4 import BeautifulSoup, Tag
from typing import List, Optional

# --- Configuration ---
# The script will read URLs from these files. Ensure they exist in the same directory.
INPUT_URL_FILES = ['relevant_articles.txt', 'relevant_articles_2.txt']
KNOWLEDGE_BASE_DIR = "data"
PARSER = 'lxml'

# Headers to mimic a web browser and avoid 403 Forbidden errors.
HEADERS = {
    # Using a common desktop browser User-Agent string
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Tags we will remove (Scripts and Styles) to clean up code that doesn't
# appear in a standard browser text dump, but leave all other page content.
JUNK_TAGS: List[str] = [
    'script', 'style',
]

def read_urls_from_files(file_list: List[str]) -> List[str]:
    """Reads URLs from a list of local files, returning a set of unique, cleaned URLs."""
    urls = set()
    print(f"--- Reading URLs from {len(file_list)} files: {', '.join(file_list)} ---")

    for filename in file_list:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                # Read all lines, strip whitespace, and filter out empty lines
                file_urls = [line.strip() for line in f if line.strip()]
                urls.update(file_urls)
            print(f"Successfully read {len(file_urls)} URLs from '{filename}'.")
        except FileNotFoundError:
            print(f"Warning: Input file '{filename}' not found. Skipping.")
        except Exception as e:
            print(f"Error reading '{filename}': {e}")

    print(f"Total unique URLs collected: {len(urls)}")
    return list(urls)


def raw_text_dump_and_save(full_url: str):
    """
    Fetches the content, removes only script/style tags, and saves a
    raw, full-page text dump exactly mimicking a browser's "Save As (Text)".
    """
    print(f"\n1. Attempting to fetch and dump raw text for: {full_url}")

    # 1. Fetch the content
    try:
        response = requests.get(full_url, timeout=30, headers=HEADERS)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED TO FETCH URL {full_url}: {e}")
        return

    soup = BeautifulSoup(response.content, PARSER)

    # 2. Extract the title (for filename only, actual title is often messy in raw dump)
    # Search for page-header class first, then general H1
    title_tag: Optional[Tag] = soup.find('h1', class_='page-header') or soup.find('h1')
    condition_title: str = title_tag.get_text(strip=True) if title_tag else "Unknown_Article"
    print(f"   -> Found Title for naming: {condition_title}")

    # 3. Remove only script and style tags from the entire document
    print("   -> Performing minimal cleanup (removing scripts/styles)...")
    for junk_tag in JUNK_TAGS:
        for element in soup.find_all(junk_tag):
            element.extract()

    # 4. Extract all text from the remaining HTML (this is the key step)
    raw_dump_content = soup.get_text(separator='\n', strip=True)
    # Collapse multiple newlines into two newlines for better paragraph separation
    raw_dump_content = re.sub(r'\n{3,}', '\n\n', raw_dump_content)
    cleaned_content = raw_dump_content.strip()

    # 5. Final cleanup: Remove header fluff and truncate footer
    
    # 5a. Header Fluff Removal: Cut content starting after the second title occurrence.
    # We use the H1 title as the marker since it is repeated in the TOC/internal nav just before the body starts.
    HEADER_MARKER = condition_title
    print(f"   -> Attempting to remove header fluff (navigation/TOC) using marker: '{HEADER_MARKER}'...")
    
    # Find the index of the first occurrence of the Title/Marker
    first_title_index = cleaned_content.find(HEADER_MARKER)
    if first_title_index != -1:
        # Find the index of the second occurrence, starting search right after the first one
        second_title_index = cleaned_content.find(HEADER_MARKER, first_title_index + len(HEADER_MARKER))
        
        if second_title_index != -1:
            # Find the position of the first newline after the second title. Start one character past that newline.
            # This ensures we skip the second title heading itself and start with the content body.
            start_newline_index = cleaned_content.find('\n', second_title_index)
            
            if start_newline_index != -1 and start_newline_index < len(cleaned_content):
                start_index = start_newline_index + 1
                cleaned_content = cleaned_content[start_index:].strip()
                print("   -> Header fluff removed successfully (starting after final title occurrence).")
                
                # Re-collapse newlines that may have been created by the aggressive slice
                cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
                cleaned_content = cleaned_content.strip()
                
            else:
                 print("   -> Could not find end-of-line after second title occurrence. Skipping header slice.")
            
        else:
            print("   -> Second title occurrence not found. Skipping header slice.")
    else:
         print("   -> First title occurrence not found. Skipping header slice.")

    # 5b. Footer Truncation: Cut content before the footer marker.
    # This marker is consistent across the source and appears just before the last updated date/feedback forms.
    TRUNCATION_MARKER = "- Opens in new browser window"
    print(f"   -> Truncating footer content using marker: '{TRUNCATION_MARKER}'...")

    if TRUNCATION_MARKER in cleaned_content:
        # Find the index of the marker
        marker_index = cleaned_content.find(TRUNCATION_MARKER)
        
        # We want to keep everything BEFORE the source information starts.
        cleaned_content = cleaned_content[:marker_index].strip()
        
        # We also need to strip the "Source: [Source Name]" line, which is immediately before the marker.
        source_line_index = cleaned_content.rfind('Source:')
        if source_line_index > cleaned_content.rfind('\n', source_line_index):
             # If 'Source:' is on the last effective line, cut before it.
             cleaned_content = cleaned_content[:source_line_index].strip()
        
        print("   -> Footer truncation successful.")
    else:
        print("   -> Truncation marker not found. Saving content as-is after header removal.")

    # 6. Save the file
    os.makedirs(KNOWLEDGE_BASE_DIR, exist_ok=True)

    # Create a safe filename for the raw dump
    slug: str = re.sub(r'[^a-z0-9]+', '-', condition_title.lower()).strip('-')
    filename: str = os.path.join(KNOWLEDGE_BASE_DIR, f"{slug}.txt")

    try:
        # Include the URL in the output file for reference
        final_content = f"Source URL: {full_url}\n\n---\n\n{cleaned_content}"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(final_content)
        print(f"✅ SUCCESS: Saved raw page dump to {filename}")
    except IOError as e:
        print(f"❌ FAILED TO SAVE FILE: {e}")


if __name__ == "__main__":
    print("*** NHS Inform Raw Text Dump Scraper (Batch Mode) ***")

    # 1. Read all unique URLs from the specified files
    all_urls = read_urls_from_files(INPUT_URL_FILES)

    if not all_urls:
        print("\nNo URLs found to scrape. Ensure 'relevant_articles.txt' and 'relevant_articles_2.txt' exist and contain valid URLs.")
    else:
        print(f"\n--- Starting scraping of {len(all_urls)} unique articles into '{KNOWLEDGE_BASE_DIR}/' ---\n")

        for i, url in enumerate(all_urls):
            print(f"\n--- Processing article {i + 1} of {len(all_urls)} ---")
            raw_text_dump_and_save(url)

            # Be a good web citizen: pause between requests
            time.sleep(1)

        print("\n--- Batch Scraping complete ---")
