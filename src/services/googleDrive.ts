import path from 'path';
import { google } from 'googleapis';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive '];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const EMAIL_ADDRESS = process.env.GOOGLE_EMAIL_ADDRESS

let authClient: any;

async function getAuth() {
  if (authClient) return authClient;

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);
  const { client_email, private_key } = credentials;

  authClient = new google.auth.JWT(
    client_email,
    undefined,
    private_key,
    SCOPES
  );

  await authClient.authorize();

  console.log('✅ Авторизація Service Account пройшла успішно');
  return authClient;
}

export async function uploadFileToDrive(filePath: string, folderId?: string) {
  try {
    const auth = await getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: path.basename(filePath),
      parents: folderId ? [folderId] : [],
    };

    const media = {
      mimeType: 'text/csv',
      body: fs.createReadStream(filePath),
    };

    console.log('🔄 Завантажую файл:', filePath);

    // 1. Створюємо файл
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = res.data.id;

    if (!fileId) throw new Error('❌ Не вдалося отримати ID завантаженого файлу');

    const webViewLink = res.data.webViewLink || `https://drive.google.com/file/d/ ${fileId}/view`;

    console.log('🟢 Файл завантажено:', {
      fileId,
      webViewLink,
      raw: res.data,
    });

    // 2. Додаємо себе як permission
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: EMAIL_ADDRESS,
      },
    });

    console.log(`📁 Посилання: ${webViewLink}`);

    return { fileId, webViewLink };
  } catch (e: any) {
    console.error('❌ Помилка при завантаженні на Google Drive:', e.message || e);
    throw e;
  }
}