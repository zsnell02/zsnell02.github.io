import os
import json
import random
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class LawList(BaseModel):
    laws: list[str]

raw_laws = set()
target_count = 10000

print("Generating clinical chaos...")

categories = [
    {
        "prompt": """Write 10 punchy, ruthless, deadpan truths mocking annoying social behavior. 
        Structure them as brief facts assuring the person that being considerate won't cause a gruesome medical emergency. 
        STRICT CONSTRAINTS:
        - Use simple, direct, conversational English. 
        - DO NOT use big 'thesaurus' words or robotic, clinical phrasing (e.g., do not say 'utilization of a personal electronic device', say 'using your phone').
        - Example 1: 'You will not suffer a brain aneurysm if you use headphones in public.'
        - Example 2: 'Your spine will not snap in half if you return your shopping cart to the corral.'
        - Make them aggressive, specific, and brief."""
    },
    {
        "prompt": """Write 10 real, highly obscure scientific, physical, or chemical laws. 
        Describe the mechanism as a sterile, undeniable fact of reality. 
        DO NOT name the law. DO NOT use mathematical variables (e.g., no 'F=ma'). 
        Use encyclopedic, detached phrasing so it sounds indistinguishable from a strict municipal legal code."""
    },
    {
        "prompt": """Write 10 bizarre but 100% REAL legal statutes. 
        STRICT CONSTRAINTS:
        - YOU MUST NOT INVENT THESE. They must be famously documented, real-world bizarre laws (e.g., laws about chewing gum, handling fish, flushing toilets after 10 PM, etc.).
        - DO NOT invent quirky garbage like 'mismatched socks' or 'garden gnomes'.
        - State the rule as a universal mandate without mentioning the location, city, country, or year. 
        - Example: 'It is strictly illegal to handle a salmon in suspicious circumstances.'"""
    }
]

# Generate the raw text first
while len(raw_laws) < target_count:
    # Pick a random category every time
    cat = random.choice(categories)
    
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a sterile, encyclopedic text engine. Output ONLY the raw text. NO titles, NO numbering, NO prefixes."},
                {"role": "user", "content": cat["prompt"]}
            ],
            response_format=LawList,
            temperature=0.8,
        )
        
        for law in response.choices[0].message.parsed.laws:
            clean_law = law.replace("Law:", "").strip()
            if clean_law not in raw_laws:
                raw_laws.add(clean_law)
                print(f"Pool size: {len(raw_laws)}")
                
    except Exception as e:
        pass

# Shuffle the final pool so the categories are hopelessly mixed
shuffled_laws = list(raw_laws)
random.shuffle(shuffled_laws)

# Apply the sequential numbering after the shuffle
final_dataset = []
for i, law_text in enumerate(shuffled_laws):
    final_dataset.append({
        "id": i + 1,
        "law": f"Law {i + 1}: {law_text}"
    })

with open("laws.json", "w") as f:
    json.dump(final_dataset, f, indent=4)
    
print("Dataset locked and shuffled.")