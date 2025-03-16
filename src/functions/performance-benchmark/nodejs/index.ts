export const handler = async () => {
  return await Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, world!" }),
  })
}
