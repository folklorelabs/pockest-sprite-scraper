type Monster = {
    monster_id: number;
    name: string;
    name_en: string;
    planId: string;
    requiredMemento: string;
    matchFever: number[];
    matchSusFever: number[];
    matchSusNormal: number[];
    age: number;
    description: string;
    description_en: string;
    from: number[];
    hash: string;
    eggId: number;
    memento_description: string;
    memento_description_en: string;
    memento_flg: boolean;
    memento_hash: string;
    memento_name: string;
    memento_name_en: string;
    new: number,
    unlock: boolean;
};

export default Monster;