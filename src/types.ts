export type TUsersDB={
    id: string,
    name: string,
    email: string,
    password:string
}

export type TTasksDB={
    id: string,
    title: string,
    description: string,
    create_at:string,
    status: number
}

export type TUserTasksDB={
    user_id: string,
    task_id: string
}   

export type TTaskWithUsers = {
    id: string,
    title: string,
    description: string,
    create_at:string,
    status: number
    responsibles: TUsersDB[]
}

