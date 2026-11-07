import json,sys
from pathlib import Path
from PIL import Image
r=json.loads(sys.argv[1]);root=Path(__file__).resolve().parents[1];image=Image.open(r['sourcePath']).convert('RGB');image.thumbnail((960,960));image.save(root/('dist'+r['url']),quality=82);image.thumbnail((320,320));image.save(root/('dist'+r['thumbnail']),quality=78);(root/'data'/'target-recovered-photo-rows'/(r['id']+'.json')).write_text(json.dumps(r,indent=2));print(r['id'])
