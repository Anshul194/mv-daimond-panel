import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";
import courseCategoryReducer from "./slices/courseCategorySlice";
// import courseReducer from './slices/courseSlice';
import size from "./slices/sizeSlice";
import color from "./slices/colorSlice";
import customAttributes from "./slices/customAttributes";
import deliveryReducer from "./slices/deliverySlice";
import product from "./slices/product";
import brand from "./slices/brandslice";
import orders from "./slices/order";
import coupon from "./slices/Coupon";
import taxClass from "./slices/taxClass";
import taxClassOption from "./slices/taxClassOption";
import blogCategoryReducer from "./slices/blogCategorySlice";
import blogSubCategoryReducer from "./slices/blogSubcategorySlice";
import blogReducer from "./slices/blog";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courseCategory: courseCategoryReducer,
    size: size,
    color: color,
    brand: brand,
    customAttributes: customAttributes,
    delivery: deliveryReducer,
    product: product,
    order: orders,
    coupon: coupon,
    taxClass: taxClass,
    taxClassOption: taxClassOption,
    blogCategory: blogCategoryReducer,
    blogSubCategory: blogSubCategoryReducer,
    blog: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
