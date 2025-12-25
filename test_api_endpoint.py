"""
Test the transformer API endpoint directly
"""
import requests
import json

# Test the API
url = "http://localhost:8000/generate/transformer"
data = {
    "prompt": "black dress",
    "num_images": 2,
    "style": "any",
    "color": "any"
}

print("Testing Transformer API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("\nSending request...")

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success!")
        print(f"Model used: {result.get('model_used')}")
        print(f"Images generated: {len(result.get('generated_images', []))}")
        print(f"Generation time: {result.get('generation_time')}s")
        
        # Save first image to test
        if result.get('generated_images'):
            import base64
            from PIL import Image
            from io import BytesIO
            
            img_data = result['generated_images'][0].split(',')[1]
            img_bytes = base64.b64decode(img_data)
            img = Image.open(BytesIO(img_bytes))
            img.save('api_test_output.png')
            print(f"Saved first image to: api_test_output.png")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ Could not connect to API!")
    print("Please start the backend server first:")
    print("  cd backend")
    print("  python run_server.py")
except Exception as e:
    print(f"\n❌ Error: {e}")
