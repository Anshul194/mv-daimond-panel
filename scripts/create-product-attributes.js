import axios from 'axios';

const BASE = process.env.VITE_BASE_URL || process.env.API_BASE_URL || 'https://ardordiamonds.com';
const TOKEN = process.env.API_TOKEN || process.env.ACCESS_TOKEN || process.env.AUTH_TOKEN || process.env.VITE_API_TOKEN || null;

const attributes = [
  {
    title: 'METAL TYPE',
    category_id: null,
    terms: [
      { value: '18k White Gold', image: '' },
      { value: '18k Rose Gold', image: '' },
      { value: '18k Yellow Gold', image: '' },
      { value: 'Platinum', image: '' }
    ]
  },
  {
    title: 'SHAPE',
    category_id: null,
    terms: [
      { value: 'Cushion', image: '' },
      { value: 'Elongated Cushion', image: '' },
      { value: 'Emerald', image: '' },
      { value: 'Heart', image: '' },
      { value: 'Marquise', image: '' },
      { value: 'Oval', image: '' },
      { value: 'Pear', image: '' }
    ]
  },
  {
    title: 'CARAT',
    category_id: null,
    terms: [
      { value: '0.25', image: '' },
      { value: '0.50', image: '' },
      { value: '0.75', image: '' },
      { value: '1.00', image: '' },
      { value: '1.50', image: '' },
      { value: '2.00', image: '' }
    ]
  },
  {
    title: 'SETTING STYLE',
    category_id: null,
    terms: [
      { value: 'Bezel', image: '' },
      { value: 'Solitaire', image: '' },
      { value: 'Trilogy', image: '' },
      { value: 'Halo', image: '' },
      { value: 'Toi et Moi', image: '' }
    ]
  },
  {
    title: 'BAND TYPE',
    category_id: null,
    terms: [
      { value: 'Plain', image: '' },
      { value: 'Pavé', image: '' },
      { value: 'Accents', image: '' }
    ]
  },
  {
    title: 'SETTING PROFILE',
    category_id: null,
    terms: [
      { value: 'High Set', image: '' },
      { value: 'Low Set', image: '' }
    ]
  },
  {
    title: 'TWO TONE',
    category_id: null,
    terms: [
      { value: 'Yes', image: '' },
      { value: 'No', image: '' }
    ]
  }
];

async function createAttribute(attr) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

    console.log('POST', `${BASE}/api/productattribute`);
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(attr, null, 2));

    const resp = await axios.post(`${BASE}/api/productattribute`, attr, {
      headers,
    });
    console.log(`Created: ${attr.title} ->`, JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error(`Error creating ${attr.title}: status=${err.response.status}`);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      console.error('Response headers:', JSON.stringify(err.response.headers, null, 2));
    } else {
      console.error(`Error creating ${attr.title}:`, err.message);
    }
  }
}

(async () => {
  console.log('Using API base:', BASE);
  for (const attr of attributes) {
    await createAttribute(attr);
  }
  console.log('Done.');
})();
