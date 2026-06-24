export default function (code: number) {
    const errorsCodes = [
        400,
        401,
        404,
        422,
        500,
        501,
    ];
    return errorsCodes.includes(code);
}