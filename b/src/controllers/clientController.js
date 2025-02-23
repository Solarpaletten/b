// /b/controllers/clientController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getClients = async (req, res) => {
  try {
    const clients = await prisma.clients.findMany({
      include: { users: true },
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await prisma.clients.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { users: true },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const client = await prisma.clients.create({
      data: {
        ...req.body,
        user_id: req.user.id, // Предполагаем, что пользователь авторизован через JWT
      },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await prisma.clients.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await prisma.clients.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.copyClient = async (req, res) => {
  try {
    const client = await prisma.clients.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const copiedClient = await prisma.clients.create({
      data: {
        ...client,
        id: undefined, // Новый ID будет сгенерирован автоматически
        name: `${client.name} (Copy)`,
        created_at: new Date(),
      },
    });
    res.json(copiedClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
