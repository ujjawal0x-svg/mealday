import json
from pathlib import Path
from PIL import Image
root=Path('/workspace/sites/mealday-app')
rows=json.load(open(root/'data/target-arab-photo-part.json'))
for row in rows:
    out=root/('dist'+row['url']); thumb=root/('dist'+row['thumbnail'])
    out.parent.mkdir(parents=True,exist_ok=True)
    if not out.exists():
        im=Image.open(row['sourcePath']).convert('RGB'); im.thumbnail((960,960)); im.save(out,'WEBP',quality=82)
    if not thumb.exists():
        im=Image.open(row['sourcePath']).convert('RGB'); im.thumbnail((320,320)); im.save(thumb,'WEBP',quality=78)
print(len(rows))
