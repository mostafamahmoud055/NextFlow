export default function (code: number) {
    const successCodes = [
        200,
        201,
        202,
        204,
    ];
    return successCodes.includes(code);
}