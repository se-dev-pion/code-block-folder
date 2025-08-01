import { regexpMatchTags } from '../common/constants';

export function matchTitle(content: string, start: number) {
    const result = content.match(regexpMatchTags);
    let end: number = -1;
    if (result) {
        switch (result[1]) {
            case ':':
                end = Number(result[2]) - 1;
                break;
            case '+':
                end = start + Number(result[2]);
                break;
        }
    }
    return [result, end] as const;
}
