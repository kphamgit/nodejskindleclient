// deck.ts
import { differenceInCalendarDays, isToday , isBefore, parseISO} from "date-fns";
import { readFileSync, writeFileSync } from "fs";
import { IFlashcard, reviewFlashcard } from "./flashcard";
import { formatInTimeZone } from 'date-fns-tz'
import { formatISO } from "date-fns"; // So that we can see the dates nicely

export let lastSeen: Date = new Date(); // The last date the deck had been loaded
export let stack: string[] = []; // The current flashcards to be reviewed for the day
export let flashcards: {
    [key: string]: IFlashcard;
} = {}; // All the flashcards from a deck file

import { parseJSON } from 'date-fns';

export let source: string; // The current filepath to the deck file

export const load = (filePath: string) => {
    source = filePath;

    const rawData = readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);
    console.log("load data =", data)

    // Updating the deck in memory with data from the file
    lastSeen = data.lastSeen;
    //console.log("type of lastSeen: ",typeof lastSeen)
//console.log("loading deck...lastSeen =", lastSeen)
//const parsedDate = parseISO('2024-08-17T12:54:55.339Z');
const parsedDate = parseJSON(lastSeen.toString())
//console.log("last seen ", parsedDate)
const lastSeenEDT = formatInTimeZone(parsedDate, 'America/New_York', 'yyyy-MM-dd HH:mm:ss')
console.log(`last seen EDT ${lastSeenEDT}`)
/*
The stack from any previous session on a previous day 
should be reset to avoid accumulation, 
but if a previous session had been started on the same day, that previous stack will be used.
*/
    flashcards = data.flashcards;
    if (isToday(lastSeen)) {
        // Use the previously saved stack
        console.log("today is lastSeen, use previously saved stack data.stack =", data.stack)
        stack = data.stack;
    } else {
        // The stack resets after each day
        console.log("today is not lastSeen. Call getInitialStack")
        stack = getInitialStack();
    }

    
};


const formatDate = (date: number) => {
    return formatISO(date, { representation: "date" });
};

export const save = (filePath?: string) => {
    // Save all deck data to `filePath` or the current deck's filePath
    filePath = filePath ?? source;

    if (filePath === undefined) {
        // This error can be caught inside the main application code
        throw new Error("No flashcards file has been opened.");
    }

    //console.log("in deck.save flashcards:", flashcards)
    const data = {
        lastSeen: new Date(),
        stack,
        flashcards,
    };

     writeFileSync(filePath, JSON.stringify(data), "utf-8");
};

const getInitialStack = (): string[] => {
    let queue: string[] = [];

    
    for (let flashcard of Object.values(flashcards)) {
        // Is the next review date for the flashcard in the past?
       console.log(" in loop getInitialStack flashcard: ", flashcard)
        //if (differenceInCalendarDays(new Date(), flashcard.nextReview) <= 0) {
        if (isBefore(flashcard.nextReview, new Date() )) {
            console.log(" is flash card is overdue: ", flashcard)
            queue.push(flashcard.id);
        }
    }
    console.log("getInitiaStack queue=", queue)
    return queue;
};


export const getNextQuestion = (): IFlashcard | null => {
    // Get the ID at the start of the stack and remove it
    const nextFlashcardId = stack.shift();

    if (nextFlashcardId) {
        return flashcards[nextFlashcardId];
    }

    return null;
};

export const assessFlashcard = (flashcardId: string, quality: number) => {
    console.log(" in deck.ts assessFlashcard input quality is: ", quality)
    if (reviewFlashcard(flashcards[flashcardId], quality)) {
        stack.push(flashcardId);
    }
};

export const addFlashcard = (flashcard: IFlashcard) => {
    const flashcardId = flashcard.id;
    flashcards[flashcardId] = flashcard;
    stack.push(flashcardId);
};

export const clearFlashcards = () => {
    // Go through each key of the object
    for (let flashcardId of Object.keys(flashcards)) {
        delete flashcards[flashcardId];
    }
     // Removes all items from stack
    stack.length = 0;
/*
    for (let flashcard of Object.values(flashcards)) {
        //delete flashcards[flashcardId];
        console.log("HHHHHH flash card next review=", flashcard.nextReview)
        console.log(`The next review date is ${formatDate(flashcard.nextReview)}`);
        //console.log("HHHHHH flash card next review=", parseJSON(flashcard.nextReview.toString()) )
        //const parsedDate = parseJSON(lastSeen.toString())
    }
*/
   
};

export const deleteFlashcard = (flashcardId: string) => {
    //export const deleteFlashcard = (flashcardId: string) => {
    console.log("****** in deck: detete card:  ", flashcards[flashcardId])
    //console.log("HEERERERERERER ")
    delete flashcards[flashcardId];
}

//deleteFlashcard
export const printFlashcards = () => {
    // Go through each key of the object
    for (let flashcard of Object.values(flashcards)) {
        //delete flashcards[flashcardId];
        console.log(" id =", flashcard.id)
        console.log(" Question =", flashcard.question)
        console.log(" Content =", flashcard.content)
        console.log(` Next review date = ${formatDate(flashcard.nextReview)}`);
        if (isBefore(flashcard.nextReview, new Date() )) {
            console.log(`***** This cards is past review Date of ${formatDate(flashcard.nextReview)}`)
        }
        
        //console.log(isBefore(new Date(1982, 6, 10), new Date(1987, 1, 11)) )
        console.log("-------------------***------------------")
       // new Date() // today's Date
        //console.log("HHHHHH flash card next review=", parseJSON(flashcard.nextReview.toString()) )
        //const parsedDate = parseJSON(lastSeen.toString())
    }
   
};


