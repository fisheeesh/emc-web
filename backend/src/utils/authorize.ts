export const authorize = (permission: boolean, empRole: string, ...roles: string[]) => {
    const result = roles.includes(empRole)

    let grant = true
    if (permission && !result) {
        grant = false
    }

    if (!permission && result) {
        grant = false
    }

    return grant
}