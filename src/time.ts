export interface Time {
    hour: Hour;
    minute: Minute;
}

export const parseTime = (arg: string): Time | undefined => {
    const matches = arg.match(/^(\d\d):(\d\d)$/);
    if (matches) {
        const hour = parseInt(matches[1]);
        const minute = parseInt(matches[2]);
        if (isHour(hour) && isMinute(minute)) {
            return { hour, minute };
        }
    }
    return undefined;
};

const isHour = (hour: number): hour is Hour => 0 <= hour && hour < 24;

const isMinute = (minute: number): minute is Minute => 0 <= minute && minute < 60;

type Hour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

type Minute =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56
    | 57
    | 58
    | 59;
