export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function,
) => {
  if (!file) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return callback(new Error('File is empty'), false);
  }

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];

  if (validExtensions.includes(fileExtension)) {
    callback(null, true);
  }
  callback(null, false);
};
