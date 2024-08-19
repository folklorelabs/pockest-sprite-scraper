import type EncycloMonster from './EncycloMonster';

type EncycloBook = {
    buckler_point: number;
    complete: boolean;
    egg_point_flg: boolean;
    egg_point_per: number;
    hash: string;
    id: number;
    max_monster_count: number;
    monster: Record<string, EncycloMonster[]>;
}

export default EncycloBook;