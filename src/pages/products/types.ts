export interface Variant {
    id: string | number;
    size: string;
    color: string;
    shape?: string;
    carat?: string;
    sku: string;
    price: string;
    stockCount: string;
    stock?: string;
    extraCost?: string;
    image: File | string | null;
    custom?: any[];
    inventoryDetailsId?: string;
}

export type ImageType = {
    file?: File;
    preview: string;
    id: string | number;
    isFeatured: boolean;
};

export type Attribute = {
    name: string;
    value: string;
};

export type ProductFormData = {
    category_id: string;
    subcategory_id: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    regularPrice: string;
    salePrice: string;
    gender: string;
    sku: string;
    stockQuantity: string;
    lowStockThreshold: string;
    stockStatus: string;
    manageStock: string;
    images: ImageType[];
    variants: Variant[];
    attributes: Attribute[];
    categories: string[];
    tax: string;
    [key: string]: any;
};
