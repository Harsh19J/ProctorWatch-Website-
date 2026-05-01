import os
import re

replacements = {
    '#6C63FF': '#D97706',
    '#38BDF8': '#FBBF24',
    '#FF4D6A': '#B45309',
    '#4ECDC4': '#0284C7',
    '#FFB74D': '#78350F',
    '#8B85FF': '#FDE68A',
    '#09090F': '#2B231D',
    '#0D0F1A': '#3A3028',
    '#F8FAFF': '#FDF8F5',
    '#EEF2FF': '#FDFCF9',
    'rgba(108,99,255': 'rgba(217,119,6',
    'rgba(108, 99, 255': 'rgba(217, 119, 6',
    'rgba(56,189,248': 'rgba(251,191,36',
    'rgba(255,77,106': 'rgba(180,83,9',
}

def update_colors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        # Case insensitive replace for hex colors
        pattern = re.compile(re.escape(old), re.IGNORECASE)
        content = pattern.sub(new, content)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            filepath = os.path.join(root, file)
            update_colors(filepath)

print("Global color replacement complete.")
