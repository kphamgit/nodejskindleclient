import { Router } from 'express';
const router = Router();

//router.get("/new", users.new);
//router.post('/', users.create) 
//router.get("/:id/edit", users.edit);
//router.put("/:id", users.update);
//router.delete("/:id", users.delete);

//router.get("/", quiz_attempts.findAll);
//router.get("/:id", quiz_attempts.findOne);

router.get("/:id", (req: any, res: any) => {
    res.send(`Quiz attempt with id ${req.params.id}`);
});
