import structuredClone from '@ungap/structured-clone';
import {useContext, useEffect, useRef, useState} from 'react';
import {FaTrash} from 'react-icons/fa';
import {GameInfoContext, GlobalStateContext, SettingsSetterContext} from './contexts';
import {ItemIcon} from './icon';
import {ItemSelect} from './item_select';
import 'mdui/components/button.js';
import 'mdui/components/text-field.js';
import 'mdui/components/dropdown.js';
import 'mdui/components/menu.js';
import 'mdui/components/menu-item.js';
import 'mdui/components/button-icon.js';

function get_item_data(game_data) {
    //通过读取配方表得到配方中涉及的物品信息，item_data中的键名为物品名，键值为
    //此物品在计算器中的id与用于生产此物品的配方在配方表中的序号
    var item_data = {};
    var i = 0;
    for (var num = 0; num < game_data.recipe_data.length; num++) {
        for (var item in game_data.recipe_data[num].产物) {
            if (!(item in item_data)) {
                item_data[item] = [i];
                i++;
            }
            item_data[item].push(num);
        }
    }
    return item_data;
}

export function NeedsList({needs_list, set_needs_list}) {
    const global_state = useContext(GlobalStateContext);
    const count_ref = useRef(60);
    const set_settings = useContext(SettingsSetterContext);
    let game_data = global_state.game_data;
    let item_data = get_item_data(game_data);
    let natural_production_line = global_state.settings.natural_production_line;
    let needs_doms = Object.entries(needs_list).map(([item, count]) => {
        function edit_count(e) {
            let new_needs_list = structuredClone(needs_list);
            new_needs_list[item] = Number(e.target.value);
            set_needs_list(new_needs_list);
        }

        function remove() {
            let new_needs_list = structuredClone(needs_list);
            delete new_needs_list[item];
            set_needs_list(new_needs_list);
        }

        return <div key={item} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
            <ItemIcon item={item}/>
            <span style={{margin: '0 4px'}}>x</span>
            <div style={{display: 'inline-flex', alignItems: 'center'}}>
                <input type="text" style={{width: '6em', padding: '4px 8px', border: '1px solid var(--mdui-color-outline)', borderRadius: '4px'}} value={count} onChange={edit_count}/>
                <mdui-button-icon onClick={remove} style={{color: 'var(--mdui-color-error)'}}>
                    <FaTrash/>
                </mdui-button-icon>
            </div>
        </div>
    });

    function add_need(item) {
        if (!(item in item_data)) {
            alert("请输入或选择正确的物品名字！");
            return;
        }
        let count = Number(count_ref.current.value);
        let new_needs_list = structuredClone(needs_list);
        new_needs_list[item] = (needs_list[item] || 0) + count;
        set_needs_list(new_needs_list);
    }

    function add_npl(item) {
        let new_npl = structuredClone(natural_production_line);
        let count = Number(count_ref.current.value);
        new_npl.push({
            "目标物品": item,
            "目标产量": count,
            "建筑数量": 10, "配方id": 1, "增产点数": 0, "增产模式": 0, "建筑": 0
        });
        set_settings({"natural_production_line": new_npl});
    }

    const is_min = global_state.settings.is_time_unit_minute;

    return <>
        <div style={{width: 'fit-content', marginTop: '16px', display: 'flex', alignItems: 'center', rowGap: '4px', flexWrap: 'wrap', gap: '8px'}}>
            <small style={{marginRight: '16px', fontWeight: 'bold', whiteSpace: 'nowrap'}}>添加需求</small>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                <input type="text" style={{width: '6em', padding: '4px 8px', border: '1px solid var(--mdui-color-outline)', borderRadius: '4px'}} ref={count_ref} defaultValue={60}/>
                <span style={{padding: '0 4px', color: 'var(--mdui-color-on-surface-variant)'}}>/{is_min ? "min" : "sec"}</span>
                <mdui-button variant="outlined" onClick={() => set_needs_list({})} style={{'--mdui-color-primary': 'var(--mdui-color-error)', whiteSpace: 'nowrap'}}>
                    清空需求
                </mdui-button>
                <ItemSelect text="添加需求物品" set_item={add_need}/>
                <ItemSelect text="添加现有产线" set_item={add_npl}
                            btn_class="mdui-success"/>
            </div>

            {Object.keys(needs_list).length == 0 ||
                <div style={{display: 'inline-flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', flexGrow: 1}}>
                    {needs_doms}
                </div>
            }
        </div>
    </>;
}

export function NeedsListStorage({needs_list, set_needs_list}) {
    const global_state = useContext(GlobalStateContext);
    const game_info = useContext(GameInfoContext);
    let game_name = global_state.game_data.game_name;

    const NEEDS_LIST_STORAGE_KEY = "needs_list";

    const all_saved = JSON.parse(localStorage.getItem(NEEDS_LIST_STORAGE_KEY)) || {};
    const [all_scheme, set_all_scheme] = useState(all_saved[game_name] || {});
    // TODO implement 实时保存

    useEffect(() => {
        let all_scheme_data = JSON.parse(localStorage.getItem(NEEDS_LIST_STORAGE_KEY)) || {};
        let all_scheme_init = all_scheme_data[game_name] || {};
        console.log("Loading storage", game_name, Object.keys(all_scheme_init));
        set_all_scheme(all_scheme_init);
    }, [game_info]);

    useEffect(() => {
        let all_scheme_saved = JSON.parse(localStorage.getItem(NEEDS_LIST_STORAGE_KEY)) || {};
        all_scheme_saved[game_name] = all_scheme;
        localStorage.setItem(NEEDS_LIST_STORAGE_KEY, JSON.stringify(all_scheme_saved));
    }, [all_scheme])

    function delete_(name) {
        if (name in all_scheme) {
            if (!confirm(`即将删除名为${name}的需求列表，是否继续`)) {
                return;// 用户取消保存
            }
            let all_scheme_copy = structuredClone(all_scheme);
            delete all_scheme_copy[name];
            set_all_scheme(all_scheme_copy);
        }
    }//删除当前保存的策略

    function load(name) {
        if (all_scheme[name]) {
            set_needs_list(all_scheme[name]);
        } else {
            alert(`未找到名为${name}的需求列表`);
        }
    }//读取生产策略

    function save() {
        let name = prompt("输入需求列表名");
        if (!name) return;
        if (name in all_scheme) {
            if (!confirm(`已存在名为${name}的需求列表，继续保存将覆盖原需求列表`)) {
                return;// 用户取消保存
            }
        }
        let all_scheme_copy = structuredClone(all_scheme);
        all_scheme_copy[name] = structuredClone(needs_list);
        set_all_scheme(all_scheme_copy);
    }//保存生产策略

    let dd_load_list = Object.keys(all_scheme).map(scheme_name => (
        <mdui-menu-item key={scheme_name} onClick={() => load(scheme_name)}>{scheme_name}</mdui-menu-item>
    ));

    let dd_delete_list = Object.keys(all_scheme).map(scheme_name => (
        <mdui-menu-item key={scheme_name} onClick={() => delete_(scheme_name)}>{scheme_name}</mdui-menu-item>
    ));

    return <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <div style={{whiteSpace: 'nowrap'}}>需求列表</div>
        <div style={{display: 'flex', gap: '4px'}}>
            <mdui-button variant="outlined" onClick={save}>保存</mdui-button>
            <mdui-dropdown>
                <mdui-button slot="trigger" variant="outlined">加载</mdui-button>
                <mdui-menu>{dd_load_list}</mdui-menu>
            </mdui-dropdown>
            <mdui-dropdown>
                <mdui-button slot="trigger" variant="outlined">删除</mdui-button>
                <mdui-menu>{dd_delete_list}</mdui-menu>
            </mdui-dropdown>
        </div>
    </div>;
}

