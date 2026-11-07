// Entrada simples por e-mail: busca o usuário ou cria um novo.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = normalizeEmail(body?.email)

  let user = await findUser(email)
  if (!user) {
    user = newUser(email)
    await saveUser(user)
  }
  return user
})
