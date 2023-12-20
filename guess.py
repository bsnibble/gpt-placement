from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import json
import time

def run_javascript(url, js_code):
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    try:
        driver.get(url)

        # Wait for the readyState to be complete
        while driver.execute_script("return document.readyState") != "complete":
            print("Waiting for page to load...")
            time.sleep(0.5)
        
        print("Page loaded, running JavaScript...") 

        return driver.execute_script(js_code)
    finally:
        driver.quit()

def query_gpt(prompt_system, prompt_user):
    # Replace with your OpenAI API key
    client = OpenAI(api_key='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')
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-1106", 
        messages=[
                {"role": "system", "content": prompt_system},
                {"role": "user", "content": prompt_user}
                ],
        max_tokens=150, 
        response_format={ "type": "json_object" }
    )
    
    return response

# Function to read JavaScript code from a file
def read_js_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

# Step 1: Request URL from user, stop if empty
user_url = input("Enter a URL: ")
if user_url == "":
    print("No URL entered, exiting...")
    exit()

# Read JavaScript code from a file
js_file_path = 'script.js'
js_code = read_js_file(js_file_path)

#print loaded JavaScript size
print("Loaded JavaScript size:", len(js_code))

#stop if size 0
if len(js_code) == 0:
    print("JavaScript file is empty, exiting...")
    exit()

print("Connecting to URL ...", user_url)

# Step 2 & 3: Open URL in Selenium and run JavaScript
js_result = run_javascript(user_url, js_code)

#if result is a valid string
if isinstance(js_result, str):
    #print first 100 characters
    print("JavaScript result:", js_result[:100], '...') 

# Step 4: Create GPT prompt
gpt_prompt_system = f"""
Analyze the provided HTML from a Shopify e-commerce product detail page.
Your task is to find the main 'Add to cart' button and the main 'product form', avoiding any other buttons related to mini-carts, sidebar or other secondary forms.
The goal is to find the correct selector to add an element AFTER the "add to cart" button

Return the information in a JSON format with the following structure:

{{\"button_or_container_selector\": selector for the 'add to cart' button or its container, prefer a selector based on the type AND class or parent class, 
 \"placement_position\": one of [afterBegin, beforeBegin, afterEnd, beforeEnd], the position where a new button should be added, 
 \"form_selector\":selector for the main product form. It could be different from the one containing the previous selector. Prefer a selector based on the form action (e.g. /cart/add) AND a class (or a parent class), Ignore IDs that contains the \"template\" substring.}}

If in doubt for each selector add an unique parent class or ID, ignore anything with a "template" substring in it

PROVIDE ONLY THE JSON STRING WITH THE LISTED KEYS"""
gpt_prompt_user = f"""
    Analyze this HTML code:
    {js_result}
"""

# Step 5: Send prompt to GPT and get response
gpt_response = query_gpt(gpt_prompt_system, gpt_prompt_user)

# Step 6: Print the response
print("GPT-3 Response")
# Extracting the JSON content
json_content = gpt_response.choices[0].message.content

# If you want to work with it as a Python dictionary
json_data = json.loads(json_content)

# Pretty-print the JSON data
formatted_json = json.dumps(json_data, indent=4)
print(formatted_json)
