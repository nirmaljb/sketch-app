import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(5).max(26),
    email: z.string().email(),
    password: z.string().min(8).max(26)
});

export const LoginUserSchema = z.object({
    username: z.string().min(5).max(26),
    password: z.string().min(8).max(26)
});

export const RoomSchema = z.object({
    name: z.string().min(3).max(25)
})

// export interface UserResponse {
//     id: string,
//     email: string,
//     username: string,
//     password: string,
//     photo: string,
//     createdAt: string,
// }
