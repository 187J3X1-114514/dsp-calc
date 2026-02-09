import {FaInfoCircle, FaQq, FaReact} from 'react-icons/fa';
import 'mdui/components/navigation-bar.js';
import 'mdui/components/navigation-bar-item.js';
import 'mdui/components/tooltip.js';
import 'mdui/components/top-app-bar.js';
import 'mdui/components/top-app-bar-title.js';
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';

export function Header() {
    const version = import.meta.env.VITE_APP_VERSION;
    return (
        <div className="header-container" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: 'var(--mdui-color-surface-container)',
            borderBottom: '1px solid var(--mdui-color-outline-variant)',
            flexWrap: 'wrap',
            gap: '8px'
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FaReact style={{fontSize: '24px', color: 'var(--mdui-color-primary)'}}/>
                <span style={{fontWeight: 500, fontSize: '18px'}}>戴森球计划量化计算器</span>
                <span style={{fontSize: '12px', color: 'var(--mdui-color-on-surface-variant)'}}>v{version}</span>
            </div>
            <nav style={{display: 'flex', gap: '8px', marginLeft: '16px', flexWrap: 'wrap'}}>
                <mdui-button variant="text" href="https://github.com/DSPCalculator/dsp-calc" target="_blank">
                    开源仓库
                </mdui-button>
                <mdui-button variant="text" href="https://www.bilibili.com/read/readlist/rl630834" target="_blank">
                    逻辑原理
                </mdui-button>
                <mdui-button variant="text" href="https://space.bilibili.com/16051534" target="_blank">
                    联系作者
                </mdui-button>
                <mdui-tooltip content="联系作者QQ:653524123&#10;加入QQ群反馈:816367922">
                    <mdui-button variant="text">
                        <FaQq style={{marginRight: '4px'}}/> QQ
                    </mdui-button>
                </mdui-tooltip>
            </nav>
            <span style={{
                marginLeft: 'auto',
                fontSize: '12px',
                color: 'var(--mdui-color-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <FaInfoCircle/> 若无法加载，尝试切换浏览器为Chrome/Edge
            </span>
        </div>
    );
}