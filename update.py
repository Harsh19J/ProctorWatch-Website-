import re

with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace colors
content = content.replace('#6C63FF', '#D97706')
content = content.replace('#38BDF8', '#FBBF24')
content = content.replace('#FF4D6A', '#B45309')
content = content.replace('#4ECDC4', '#0284C7')
content = content.replace('#FFB74D', '#78350F')
content = content.replace('#8B85FF', '#FDE68A')
content = content.replace('✦ ', '')
content = content.replace('rgba(108,99,255', 'rgba(217,119,6')

# Replace ParticleCanvas block with ScrollSequence
start_idx = content.find('// ─── Particle Canvas')
end_idx = content.find('// ─── Typewriter hook')

scroll_seq = '''// ─── Scroll Sequence Animation ────────────────────────────────────────────────
function ScrollSequence({ children }) {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loaded, setLoaded] = useState(0);

    useEffect(() => {
        const frameCount = 200;
        const imgs = [];
        let loadedCount = 0;
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = /frames/ezgif-frame-.jpg;
            img.onload = () => {
                loadedCount++;
                setLoaded(loadedCount);
            };
            imgs.push(img);
        }
        setImages(imgs);
    }, []);

    useEffect(() => {
        if (loaded < 200 || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });

        const render = (index) => {
            if (images[index]) {
                const img = images[index];
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio);
                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;  
                ctx.fillStyle = '#2B231D';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            }
        };

        const handleScroll = () => {
            const container = document.getElementById('scroll-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const scrollDistance = container.offsetHeight - window.innerHeight;
            let scrollProgress = -rect.top / scrollDistance;
            
            if (scrollProgress < 0) scrollProgress = 0;
            if (scrollProgress > 1) scrollProgress = 1;
            
            const frameIndex = Math.min(199, Math.floor(scrollProgress * 200));
            requestAnimationFrame(() => render(frameIndex));
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            handleScroll();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [loaded, images]);

    return (
        <Box id="scroll-container" sx={{ height: '350vh', position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(43,35,29,0.5) 0%, rgba(43,35,29,0.95) 100%)',
                    pointerEvents: 'none'
                }} />
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

'''
# Note: In powershell, the $ is interpolated, so we must be careful. 
# But python strings are not interpolated by powershell if we don't have $ in powershell context except when defined.
# I will use javascript template string safely:
scroll_seq = scroll_seq.replace('', '')

content = content[:start_idx] + scroll_seq + content[end_idx:]

# Replace Orb component
start_orb = content.find('// ─── Floating Orb')
end_orb = content.find('// ─── Framed screenshot')
if start_orb != -1 and end_orb != -1:
    content = content[:start_orb] + content[end_orb:]

content = re.sub(r'<Orb.*?\/>', '', content)

hero_new = '''            {/* ═══ HERO OVERLAY ON SCROLL SEQUENCE ════════════════════════════════ */}
            <ScrollSequence>
                <Box id="home" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 8, pointerEvents: 'none', '& *': { pointerEvents: 'auto' } }}>
'''
pattern_hero = re.compile(r'\{\/\* ═══ HERO ════.*?<ParticleCanvas isDark=\{isDark\} \/>', re.DOTALL)
content = pattern_hero.sub(hero_new, content)

pattern_features = re.compile(r'(\s*)</Box>\s*</Box>\s*\{\/\* ═══ FEATURES ════')
content = pattern_features.sub(r'\g<1></Box>\n            </ScrollSequence>\n\n            {/* ═══ FEATURES ════', content)

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated LandingPage.jsx")
