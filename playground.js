// @ts-nocheck
import crypto from 'crypto'
import fs from 'fs'

const keyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: ''
  }
});
// // Creating public and private key file 
// fs.writeFileSync("public_key", keyPair.publicKey);
// fs.writeFileSync("private_key", keyPair.privateKey);
// let privKey = process.env.PRIVATE_KEY;
// let pubKey = process.env.PUBLIC_KEY;

function encryptString(plaintext, publicKey) {
  const encrypted = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  }, Buffer.from(plaintext, 'utf8'));

  return encrypted.toString("base64");
}

function decryptString(ciphertext, privateKey) {
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase: '',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(ciphertext, "base64")
  );

  return decrypted.toString("utf8");
}

let json = {
  "id": "d8a147b4-3701-4951-b119-89ab11f96210",
  "email": "undip3@mail.com",
  "name": "undip3",
  "password": "935b75730087ee4f25d7ef308c5a39bd108af62ac7d47250f4e9333036760b40cf089c15fab35fbc9c8724b121a16a2e1441aa969bde5c44ab8e57a64ab6c5d6",
  "salt": "ea4a9f9ef2b96a87eed14768d3d3ab24",
  "organizationId": "ec6f91af-4547-4a26-b106-b417fb45b182",
  "createdAt": "2022-12-19T07:58:50.962Z",
  "updatedAt": "2022-12-19T07:58:50.962Z"
}

const plainText = JSON.stringify(json)
// const encrypted = encryptString(plainText, pubKey);
// console.log("Plaintext:", plainText);
// console.log("Encrypted Text: ", encrypted);
// const decrypted = decryptString(encrypted, privKey)
// console.log("Decrypt", decrypted)


// Defining algorithm
const algorithm = 'aes-192-cbc';
const password = "test123";
const key = crypto.scryptSync(password, "pub123", 24);
const iv = Buffer.alloc(16, 0);

// Creating cipher
const cipher = crypto.createCipheriv(algorithm, key, iv); //encrypt
const decipher =
  crypto.createDecipheriv(algorithm, key, iv); //decrypt

let encrypted = '';
let decrypted = '';

cipher.on('readable', () => {
  let chunk;
  while (null !== (chunk = cipher.read())) {
    encrypted += chunk.toString('base64');
  }
});

decipher.on('readable', () => {
  let chunk;
  while (null !== (chunk = decipher.read())) {
    decrypted += chunk.toString('utf8');
  }
});

cipher.on('end', () => {
  console.log(encrypted);
});

decipher.on('end', () => {
  console.log(decrypted);
});

cipher.write('halo');
cipher.end();

decipher.write(encrypted, 'base64');
decipher.end();




const data = [
  {
    id: 1,
    hash: "123",
    prevHash: ""
  },
  {
    id: 2,
    hash: "234",
    prevHash: "123"
  },
  {
    id: 3,
    hash: "345",
    prevHash: "234"
  },
  {
    id: 4,
    hash: "456",
    prevHash: "348"
  },
  {
    id: 5,
    hash: "567",
    prevHash: "456"
  },
  {
    id: 6,
    hash: "678",
    prevHash: "569"
  },
]

let result = [];

for (let i in data) {
  let hash = data[i - 1]?.hash;
  let prevHash = data[i].prevHash;
  if (hash == prevHash) {
    result.push({
      status: true,
      data: data[i]
    })
  } else {
    result.push({
      status: false,
      data: data[i]
    })
  }
}

const chain = result.splice(1);
if (!chain.includes(false)) {
  console.log("Good chain")
} else {
  console.log("Bad Chain")
}
console.log(chain)
