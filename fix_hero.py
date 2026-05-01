import re

with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add children to ScrollSequence
content = content.replace('function ScrollSequence() {', 'function ScrollSequence({ children }) {')

# 2. Add {children} to the sticky box inside ScrollSequence
old_scroll_return = '''    return (
        <Box id="scroll-container" sx={{ height: '350vh', position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(43,35,29,0.4) 0%, rgba(43,35,29,0.95) 100%)',
                    pointerEvents: 'none'
                }} />
            </Box>
        </Box>
    );'''

new_scroll_return = '''    return (
        <Box id="scroll-container" sx={{ height: '350vh', position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(43,35,29,0.4) 0%, rgba(43,35,29,0.95) 100%)',
                    pointerEvents: 'none'
                }} />
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );'''
content = content.replace(old_scroll_return, new_scroll_return)

# 3. Clean up the Hero wrapper
# Currently it looks like:
'''
            <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <ScrollSequence />
                </Box>
                {/* ═══ HERO OVERLAY ════════════════════════════════════════════════════════ */}
                <Box id="home" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 8, zIndex: 1, pointerEvents: 'none', '& *': { pointerEvents: 'auto' } }}>

                {/* BG layers */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: isDark
                        ? 'linear-gradient(135deg, #2B231D 0%, #3A3028 50%, #2B231D 100%)'
                        : 'linear-gradient(135deg, #FDF8F5 0%, #FDFCF9 100%)',
                }} />
                {/* Grid */}
                <Box sx={{
                    position: 'absolute', inset: 0, opacity: isDark ? 0.025 : 0.04,
                    backgroundImage: 'linear-gradient(rgba(217,119,6,1) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
'''
# We will regex replace this entire block.

pattern_hero_start = re.compile(r'<Box sx={{ position: \'relative\' }}>\s*<Box sx={{ position: \'absolute\', inset: 0, zIndex: 0 }}>\s*<ScrollSequence />\s*</Box>\s*\{/\* ═══ HERO OVERLAY ════════════════════════════════════════════════════════ \*/\}\s*<Box id="home"[^>]*>[\s\S]*?(<Container)', re.MULTILINE)

new_hero_start = '''<ScrollSequence>
                {/* ═══ HERO CONTENT ════════════════════════════════════════════════════════ */}
                <Box id="home" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 8, pointerEvents: 'none', '& *': { pointerEvents: 'auto' } }}>
                    \\1'''

content = pattern_hero_start.sub(new_hero_start, content)

# Also we need to change the closing tag of the wrapper before FEATURES.
# Currently it is:
#             </Box>
#
#             {/* ═══ FEATURES ════════════════════════════════════════════════════ */}
content = content.replace('            </Box>\n\n            {/* ═══ FEATURES', '                </Box>\n            </ScrollSequence>\n\n            {/* ═══ FEATURES')

# Remove any leftover empty Grid box if it wasn't caught
content = re.sub(r'<Box sx={{[\s\S]*?backgroundImage: \'linear-gradient.*?}} />', '', content)
content = re.sub(r'<Box sx={{[\s\S]*?background: isDark[\s\S]*?}} />', '', content)

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
