import { IMember } from "qq-guild-bot";
import { idToName } from "../lib/common";
import { IMessageEx } from "../lib/IMessageEx";
import { execSync } from "child_process";

export async function addAdmin(msg: IMessageEx) {
    if (!msg.mentions) return msg.sendMsgEx({ content: `未指定用户` });
    const sendStr: string[] = [`已对下列用户添加管理权限`];
    for (const member of msg.mentions) {
        if (member.bot) continue;
        await redis.hSet("auth", member.id, "admin");
        sendStr.push(`${await idToName(member.id)}`);
    }
    return msg.sendMsgEx({ content: sendStr.join("\n") });
}

export async function testShell(msg: IMessageEx) {
    if (!adminId.includes(msg.author.id)) return;
    const code = /^运行命令(.*)/.exec(msg.content)![1];
    try {
        //log.debug(execSync(code).toString());
        msg.sendMsgEx({ content: execSync(code).toString().replaceAll(".", ". "), }).catch(err => {
            //log.error(err);
        });
    } catch (error) {
        msg.sendMsgEx({ content: (error as any).toString().replaceAll(".", ". "), });
    }

}

export async function isAdmin(uid: string, iMember?: IMember): Promise<boolean> {
    if (adminId.includes(uid)) return true;
    if (iMember && (iMember.roles.includes("2") || iMember.roles.includes("4")))
        return true;
    return await redis.hGet("auth", uid).then(auth => {
        if (auth == "admin") return true;
        return false;
    });
}

export function devAdmin(uid: string): boolean {
    if (devEnv) {
        if (adminId.includes(uid)) return true;
        else return false;
    }
    return true;
}