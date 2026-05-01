with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('img.src = /frames/ezgif-frame-.jpg;', 'img.src = /frames/ezgif-frame-.jpg;')

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
