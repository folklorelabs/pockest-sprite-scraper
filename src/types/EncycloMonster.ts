type EncycloMonster = {
    monster_id: number;
    name: string;
    name_en: string;
    age: number;
    description: string;
    description_en: string;
    from: number[];
    hash: string;
    memento_description: string;
    memento_description_en: string;
    memento_flg: boolean;
    memento_hash: string;
    memento_name: string;
    memento_name_en: string;
    new: number,
    unlock: boolean;
    eggId?: number;
};

export default EncycloMonster;