// Atualiza o nome exibido no perfil e no ranking.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; name?: string }>(event)
  const user = await requireUser(body?.email)
  user.name = normalizeName(body?.name)
  await saveUser(user)
  return user
})
