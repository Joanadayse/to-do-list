import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/kenex";
import { strict } from "assert";
import { TTasksDB, TUsersDB } from "./types";
import { title } from "process";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`);
});

app.get("/ping", async (req: Request, res: Response) => {
  try {
    res.status(200).send({ message: "Pong!" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const searchTerm = (req.query.q as string) || undefined;

    if (searchTerm === undefined) {
      const result = await db("users");
      res.status(200).send(result);
    } else {
      const result = await db("users").where("name", "LIKE", `%${searchTerm}%`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;

    if (typeof id !== "string") {
      res.status(400);
      throw new Error("id deve ser string");
    }
    if (id.length < 4) {
      res.status(400);
      throw new Error("id deve possuir 4 caracteres");
    }
    if (typeof name !== "string") {
      res.status(400);
      throw new Error("name deve ser string");
    }

    if (name.length < 4) {
      res.status(400);
      throw new Error("name deve possuir 4 caracteres");
    }
    if (typeof email !== "string") {
      res.status(400);
      throw new Error("name deve ser string");
    }

    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
      )
    ) {
      throw new Error(
        "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial"
      );
    }

    const [userIdAlreadExists]: TUsersDB[] | undefined[] = await db(
      "users"
    ).where({ id: id });

    if (userIdAlreadExists) {
      res.status(400);
      throw new Error(" 'id' ja existe");
    }

    const [userEmailAlreadExists]: TUsersDB[] | undefined[] = await db(
      "users"
    ).where({ email });

    if (userEmailAlreadExists) {
      res.status(400);
      throw new Error(" 'email' ja existe");
    }

    const newUser: TUsersDB = {
      id,
      name,
      email,
      password,
    };

    await db("users").insert(newUser);
    res
      .status(200)
      .send({ message: "user criado com sucesso!", user: newUser });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    if (idToDelete[0] !== "f") {
      res.status(404);
      throw new Error("'id' deve iniciar com a letra 'f");
    }

    const [userIdAlreadExists]: TUsersDB[] | undefined[] = await db(
      "users"
    ).where({ id: idToDelete });

    if (!userIdAlreadExists) {
      res.status(404);
      throw new Error("'id' não encontrado");
    }

    await db("users").del().where({ id: idToDelete });
    res.status(200).send({ message: "user deletado com sucesso" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});


app.get("/tasks", async (req: Request, res: Response) => {
  try {
   const searchTerm= req.query.q as string | undefined;

   if(searchTerm===undefined){
    const result= await db("tasks");
    res.status(200).send(result);
   }else{
      const result= await db("tasks")
      .where("title", "LIKE", `%${searchTerm}%`)
      .orWhere("description", "LIKE", `%${searchTerm}%`)
      res.status(200).send(result)
    }

    res.status(200).send({ message: "Pong!" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const { id, title, description} = req.body;



    if (typeof id !== "string") {
      res.status(400);
      throw new Error("id deve ser string");
    }
    if (id.length < 4) {
      res.status(400);
      throw new Error("id deve possuir 4 caracteres");
    }
    if (typeof title !== "string") {
      res.status(400);
      throw new Error("title deve ser string");
    }

    if (title.length < 2) {
      res.status(400);
      throw new Error("name deve possuir 4 caracteres");
    }
    if (typeof title !== "string") {
      res.status(400);
      throw new Error("name deve ser string");
    }

    if (typeof description !== "string"){
      throw new Error(
        "'description' precisa ser string ");
    }

    const [tasksIdAlreadExists]: TTasksDB[] | undefined[] = await db("tasks").where({ id: id });

    if (tasksIdAlreadExists) {
      res.status(400);
      throw new Error(" 'id' ja existe");
    }

    const newTasks= {
      id,
      title,
      description
    };

    await db("tasks").insert(newTasks);
    const insertTasks= await db("tasks").where({id})
    res
      .status(200)
      .send({ message: "tasks criado com sucesso!", task:  insertTasks});
 
    } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.put("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit= req.params.id;
    
    const newid= req.body.id;
    const newTitle= req.body.title;
    const newDescription= req.body.description;
    const newCreateAt= req.body.create_at;
    const newStatus= req.body.status;

 if(newid !== undefined){
  if (typeof newid !== "string") {
    res.status(400);
    throw new Error("id deve ser string");
  }
  if (newid.length < 4) {
    res.status(400);
    throw new Error("id deve possuir 4 caracteres");
  }
  
 }

  if (newTitle !== undefined){
    
    if (typeof newTitle !== "string") {
      res.status(400);
      throw new Error("title deve ser string");
    }

    if (newTitle.length < 2) {
      res.status(400);
      throw new Error("name deve possuir 4 caracteres");
    }
    if (typeof newTitle !== "string") {
      res.status(400);
      throw new Error("name deve ser string");
    }
  }

  if(newDescription !== undefined){
    if (typeof newDescription !== "string"){
      res.status(404);
      throw new Error("'description' precisa ser string ");
    }

  }
    
  if (newCreateAt !== undefined){
    if(typeof newCreateAt !== "string"){
      res.status(404);
      throw new Error("'createAt' precisa ser string ");

    }
  }
  if (newStatus !== undefined){
    if(typeof newStatus!== "number"){
      res.status(404);
      throw new Error("'status' precisa ser number (0 para incompleta ou 1 para completa) ");
    }
  }
  
  const [task]: TTasksDB[] | undefined[] = await db("tasks").where({ id: idToEdit });

    if (!task) {
      res.status(404);
      throw new Error(" 'id' não encontado");
    }

    const newTask: TTasksDB= {
    id: newid || task.id,
    title: newTitle || task.title,
    description: newDescription || task.description,
    create_at: newCreateAt || task.create_at,
    status: isNaN(newStatus) ? task.status : newStatus
    };

    await db("tasks").update(newTask).where({id:idToEdit})
   
    res
      .status(200)
      .send({ message: "tasks editada com sucesso!", task:  newTask});
 
    } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});


app.delete("/tasks/:id", async (req: Request, res: Response) => {
  try {

    const idToDelete= req.params.id;

    if (idToDelete[0] !== "t") {
      res.status(404);
      throw new Error("'id' deve iniciar com a letra 't");
    }

    const [tasksIdAlreadExists]: TTasksDB[] | undefined[] = await db(
      "tasks"
    ).where({ id: idToDelete });

    if (!tasksIdAlreadExists) {
      res.status(404);
      throw new Error("'id' não encontrado");
    }

    await db("users_tasks").del().where({task_id:idToDelete});

    await db("tasks").del().where({ id: idToDelete });
   
    res.status(200).send({ message: "task deletado com sucesso" });
 

    } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});
