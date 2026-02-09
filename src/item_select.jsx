import {useContext, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {GameInfoContext} from './contexts.jsx';
import {ItemIcon} from './icon';
import fuzzysort from 'fuzzysort'
import {pinyin} from 'pinyin-pro';
import 'mdui/components/dialog.js';
import 'mdui/components/button.js';
import 'mdui/components/text-field.js';

function ItemSelectPanel({fuzz_result, onSelect, icon_grid}) {
    let fuzz_set = new Set(fuzz_result);

    const doms = icon_grid.icons.map(({col, row, item}) => {
        let opacity = fuzz_set.has(item) ? 1 : 0.25;
        return <div key={col + "#" + row}
                    style={{
                        gridRow: row, 
                        gridColumn: col, 
                        opacity: opacity,
                        cursor: 'pointer',
                        backgroundColor: 'var(--mdui-color-surface-container-low)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--mdui-color-surface-container-high)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--mdui-color-surface-container-low)'}
                    onClick={() => onSelect(item)}>
            <ItemIcon item={item} size={48}/>
        </div>;
    })

    return <div style={{
        padding: '16px',
        width: 'fit-content',
        borderRadius: '12px',
        gap: '4px',
        display: 'grid',
        gridTemplateColumns: `repeat(${icon_grid.ncol}, max-content)`,
        gridTemplateRows: `repeat(${icon_grid.nrow}, max-content)`,
    }}>
        {doms}
    </div>;
}

export function ItemSelect({item, set_item, text, btn_class}) {
    const ref = useRef();
    const input_ref = useRef();

    const game_info = useContext(GameInfoContext);
    const all_target_items = game_info.all_target_items;
    const [fuzz_result, set_fuzz_result] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const search_targets = all_target_items.map(item => ({
        item: item,
        py_first: pinyin(item, {pattern: 'first', type: 'array'}).join(""),
        py_full: pinyin(item, {toneType: 'none'})
    }));

    const RESULT_LIMIT = 10;

    useEffect(() => {
        set_fuzz_result(game_info.all_target_items);
    }, [game_info]);

    function do_search(value) {
        if (!value) {
            set_fuzz_result(all_target_items);
        } else {
            let search_result = fuzzysort.go(value, search_targets, {
                keys: ["item", "py_first", "py_full"],
                limit: RESULT_LIMIT,
            });
            set_fuzz_result(search_result.map(e => e.obj.item));
        }
    }

    function on_select_item(item) {
        set_item(item);
        setIsOpen(false);
    }

    let search_result_doms = fuzz_result.length > RESULT_LIMIT ? [] : fuzz_result.map((item, i) => {
        let bgOpacity = i == 0 ? 0.75 : 0.25;
        return <div key={item} style={{
            backgroundColor: `rgba(var(--mdui-color-secondary-rgb), ${bgOpacity})`,
            color: 'var(--mdui-color-on-secondary)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        }}
             onClick={() => on_select_item(item)}>
            <ItemIcon item={item} tooltip={false}/>
            <small>{item}</small>
        </div>;
    });

    function on_search_keydown(e) {
        if (e.keyCode == 13 && fuzz_result.length > 0 && fuzz_result.length <= RESULT_LIMIT) {
            on_select_item(fuzz_result[0]);
        }
    }

    useEffect(() => {
        if (isOpen && input_ref.current) {
            setTimeout(() => {
                input_ref.current.select();
                input_ref.current.focus();
            }, 100);
        }
    }, [isOpen]);

    const isSuccess = btn_class === 'mdui-success';
    const buttonStyle = isSuccess ? {
        '--mdui-color-primary': '#4caf50'
    } : {};

    function show() {
        setIsOpen(true);
    }

    return <>
        <mdui-button variant="outlined" onClick={show} style={{...buttonStyle, display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
            {item && <><ItemIcon item={item} size={24} tooltip={false}/></>}
            {(item) ?
                <small style={{whiteSpace: 'nowrap'}}>{item}</small>
                : <span style={{whiteSpace: 'nowrap'}}>{text}</span>}
        </mdui-button>

        {createPortal(
            <mdui-dialog open={isOpen ? true : undefined} onclose={() => setIsOpen(false)} style={{maxWidth: 'fit-content'}}>
                <div style={{display: 'flex', flexDirection: 'row', backgroundColor: 'var(--mdui-color-surface-container)', borderRadius: '12px'}}>
                    <ItemSelectPanel fuzz_result={fuzz_result} icon_grid={game_info.icon_grid}
                                     onSelect={on_select_item}/>
                    <div style={{padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <input ref={input_ref} style={{
                            borderRadius: '12px',
                            padding: '8px 12px',
                            margin: '4px 0',
                            border: '1px solid var(--mdui-color-outline)',
                            backgroundColor: 'var(--mdui-color-surface)',
                            color: 'var(--mdui-color-on-surface)'
                        }}
                               placeholder="搜索（支持拼音）"
                               onChange={e => do_search(e.target.value)} onKeyDown={on_search_keydown}/>
                        {search_result_doms}
                    </div>
                </div>
            </mdui-dialog>
            , document.body)}
    </>;
}
