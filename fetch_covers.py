import urllib.request
import json

books = [
    "Mi historia Michelle Obama becoming audiobook",
    "Con luz propia Michelle Obama audiobook",
    "Ojos azules Toni Morrison bluest eye",
    "Come, reza, ama Elizabeth Gilbert eat pray love",
    "Una educacion Tara Westover",
    "La maravillosa vida breve de Oscar Wao Junot Diaz",
    "Jardin de invierno Kristin Hannah",
    "Sanate Nicole LePera"
]

results = {}

for query in books:
    encoded_query = urllib.parse.quote(query)
    url = f"https://itunes.apple.com/search?term={encoded_query}&entity=audiobook&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data['results']:
                # Replace 100x100 with larger resolution
                img_url = data['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                results[query] = img_url
            else:
                # specifically for bluest eye / toni morrison, try ebook instead
                url2 = f"https://itunes.apple.com/search?term={encoded_query}&entity=ebook&limit=1"
                req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req2) as resp2:
                    data2 = json.loads(resp2.read().decode())
                    if data2['results']:
                        img_url2 = data2['results'][0]['artworkUrl100'].replace("100x100bb", "600x600bb")
                        results[query] = img_url2
                    else:
                        results[query] = "NOT_FOUND"
    except Exception as e:
        results[query] = str(e)

for k, v in results.items():
    print(f"'{k}': '{v}'")
