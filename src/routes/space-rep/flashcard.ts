import {v4} from 'uuid';
import { addDays } from 'date-fns';
// flashcard.ts
// website for this app: https://cs310.hashnode.dev/spaced-repetition-flashcards-nodejs
const uuid = v4()
//Good YOUTUBE video on SM3 algorithm: https://www.youtube.com/watch?v=dF5rY3xQeAQ

export interface IFlashcard {
    id: string; // To uniquely identify flashcards
    question: string; // The text that goes on the front of the card
    content: string; // The answer to the question
    easiness: number; // Reflects how easy it is to recall the content
    interval: number; // The number of days after which a review is need
    repetitions: number; // How many times the flashcard has been recalled correctly in a row
    nextReview: number; // The earliest date we can review the flashcard
}

export const createFlashcard = (
    question: string,
    content: string
): IFlashcard => {
    return {
        id: uuid,
        question,
        content,
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: new Date().getTime(), // So that we review it on the day of creation or later
    };
};

export const reviewFlashcard = (
    flashcard: IFlashcard,
    quality: number,
    reviewDate?: number
) => {
    flashcard.repetitions++;

    console.log("reviewFlashcard ENTRY. flashcard.repetitions = ", flashcard.repetitions)

    let interval: number;
    switch (flashcard.repetitions) {
        case 1:
            console.log("flashcard.repetitions = 1. Set interval to 1 (next day) ")
            interval = 1;
            break;
        case 2:
            console.log("flashcard.repetitions = 2. Set interval to 6 (5 days later) ")
            interval = 6;
            break;
        default:
            interval = Math.round(flashcard.interval * flashcard.easiness);
            console.log("flashcard.repetitions > 2. Interval = interval*easiness = ", interval )
    }

    let easiness =
        flashcard.easiness +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (easiness < 1.3) {
        easiness = 1.3;
    }

    if (quality < 4) {
        console.log(" input quality < 4. Having difficulty recalling. Set interval to 1 (next day)")
        interval = 1;
        flashcard.repetitions = 1;
    } else {
        console.log(" quality >= 4. Easy. Use adjusted easiness. ")
        flashcard.easiness = easiness;
    }

    flashcard.interval = interval;
    // Gets the next review date as the current date, `interval` days later
    flashcard.nextReview = getIntervalDate(interval, reviewDate);
    console.log("returns true if quality < 4 (having difficulty recalling)")
    const return_value = quality < 4
    console.log(" EXIT reviewFlashcard quality < 4 is: ", return_value)

    return return_value;
};

// Uses optional `date` argument
const getIntervalDate = (interval: number, date?: number) => {
    return addDays(date ?? new Date().getTime(), interval).getTime();
};
