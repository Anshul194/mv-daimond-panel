import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/AddCategory";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AddCategory from "./pages/AddCategory";
import CategoryList from "./pages/CategoryList";
import SubCategoryList from "./pages/SubCategoryList";
import AddSubCategory from "./pages/AddSubCategory";
import AddSize from "./pages/Attributes/Size/AddSize";
import ColorList from "./pages/Attributes/colors/ColorList";
import AddColor from "./pages/Attributes/colors/AddColor";
import SizeList from "./pages/Attributes/Size/SizeList";
import AddCustomAttribute from "./pages/Attributes/customAttributes/AddCustom";
import CustomAttributeList from "./pages/Attributes/customAttributes/CustomList";
import BrandList from "./pages/Attributes/Brand/BrandList";
import AddBrand from "./pages/Attributes/Brand/AddBrand";
import AddDeliveryOption from "./pages/Attributes/DeliveryOptions/AddDeliveryOption";
import DeliveryOptionList from "./pages/Attributes/DeliveryOptions/DeliveryOptionList";
import ProductForm from "./pages/products/AddProduct";
import BlogPageBuilder from "./pages/blogs/editor";
import ProductList from "./pages/products/productList";
import EditProductForm from "./pages/products/EditeProducts";
import OrderList from "./pages/products/components/OrderListing";
import EditOrder from "./pages/products/components/EditeOrder";
import AddCupon from "./pages/products/components/AddCupon";
import CouponList from "./pages/products/components/Coupon";
import UpdateCouponPage from "./pages/products/components/EditeCoupon";
import TaxList from "./pages/products/components/TaxesList";
import AddTaxClass from "./pages/products/components/AddTaxClass";
import UpdateTaxClass from "./pages/products/components/EditeTaxClass";
import TaxOptionsList from "./pages/products/components/TaxClassOptionList";
import AddTaxOption from "./pages/products/components/AddTaxOptions";
import EditTaxOption from "./pages/products/components/EditeTaxOptions";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { selectIsAuthenticated } from "./store/slices/authslice";
import AddBlogCategory from "./pages/blogs/AddCategory";
import BlogCategoryList from "./pages/blogs/CategoryList";
import EditBlogCategory from "./pages/blogs/Editecategory";
import BlogSubCategoryList from "./pages/blogs/SubCategoryList";
import AddBlogSubCategory from "./pages/blogs/AddSubCategory";
import EditBlogSubCategory from "./pages/blogs/EditSubCategory";
import AddBlog from "./pages/blogs/AddBlog";
import BlogList from "./pages/blogs/BlogList";
import EditBlog from "./pages/blogs/EditeBlog";
import AddVendor from "./pages/Vendor/AddVendor";
import VenderList from "./pages/Vendor/VenderList";
import CustomerList from "./pages/Customer/CustomerList";
import ProductReviews from "./pages/Customer/ProductReviews";
import CustomerFeedback from "./pages/Customer/CustomerFeedback";
import FaqList from "./pages/Faqs/FaqList";
import BannerList from "./pages/Banners/BannerList";
import StoryList from "./pages/Story/StoryList";
import CollectionList from "./pages/Collections/CollectionList";
import ReviewList from "./pages/Reviews/ReviewList";

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/signin") {
      window.location.href = "/signin"; // Redirect to login page if not authenticated
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route
              path="/attributes/categories/add"
              element={<AddCategory />}
            />

            <Route
              path="/attributes/categories/list"
              element={<CategoryList />}
            />
            <Route
              path="/attributes/subcategories/"
              element={<SubCategoryList />}
            />
            <Route
              path="/attributes/subcategories/add"
              element={<AddSubCategory />}
            />
            <Route path="/attributes/size-charts/add" element={<AddSize />} />
            <Route path="/attributes/size-charts/list" element={<SizeList />} />
            <Route path="/attributes/brand/list" element={<BrandList />} />
            <Route path="/attributes/brand/add" element={<AddBrand />} />
            <Route
              path="/attributes/delivery-options/list"
              element={<DeliveryOptionList />}
            />
            <Route
              path="/attributes/delivery-options/add"
              element={<AddDeliveryOption />}
            />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/edit-product/:id" element={<EditProductForm />} />
            <Route path="/products/all" element={<ProductList />} />

            <Route path="/blog" element={<BlogPageBuilder />} />
            <Route path="/blog/category/add" element={<AddBlogCategory />} />
            <Route path="/blog/category/list" element={<BlogCategoryList />} />
            <Route
              path="/blog/category/edit/:id"
              element={<EditBlogCategory />}
            />
            <Route
              path="/blog/subcategory/add"
              element={<AddBlogSubCategory />}
            />
            <Route
              path="/blog/subcategory/list"
              element={<BlogSubCategoryList />}
            />
            <Route
              path="/blog/subcategory/edit/:id"
              element={<EditBlogSubCategory />}
            />
            <Route path="/blog/add" element={<AddBlog />} />
            <Route path="/blog/list" element={<BlogList />} />
            <Route path="/blog/edit/:id" element={<EditBlog />} />

            {/* orders */}
            <Route path="/orders/all" element={<OrderList />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />

            {/* orders */}
            <Route path="/vendor/add" element={<AddVendor />} />
            <Route path="/vendor/list" element={< VenderList />} />

            {/* Customers */}
            <Route path="/customers/all" element={<CustomerList />} />
            <Route path="/customers/reviews" element={<Navigate to="/customers/reviews/products" replace />} />
            <Route path="/customers/reviews/products" element={<ProductReviews />} />
            <Route path="/customers/reviews/feedback" element={<CustomerFeedback />} />
            <Route path="/faqs/all" element={<FaqList />} />
            <Route path="/banners/all" element={<BannerList />} />
            <Route path="/story/all" element={<StoryList />} />
            <Route path="/collections/all" element={<CollectionList />} />
            <Route path="/reviews/all" element={<ReviewList />} />

            {/* Coupons */}
            {/* <Route path="/coupons/all" element={<CouponList />} /> */}
            <Route path="/coupons/add" element={<AddCupon />} />
            <Route path="/coupons/all" element={<CouponList />} />
            <Route path="/coupons/edit/:id" element={<UpdateCouponPage />} />

            {/* Taxes */}
            <Route path="/taxes/all" element={<TaxList />} />
            <Route path="/taxes/add" element={<AddTaxClass />} />
            <Route path="/taxes/edit/:id" element={<UpdateTaxClass />} />

            {/* Taxes Options */}
            <Route path="/taxes/options/all" element={<TaxOptionsList />} />
            <Route path="/taxes/options/add" element={<AddTaxOption />} />
            <Route path="/taxes/options/edit/:id" element={<EditTaxOption />} />

            {/* Attributes */}
            <Route path="/attributes/colors/list" element={<ColorList />} />
            <Route path="/attributes/colors/add" element={<AddColor />} />
            <Route
              path="/attributes/customs/add"
              element={<AddCustomAttribute />}
            />
            <Route
              path="/attributes/customs/list"
              element={<CustomAttributeList />}
            />

            {/* Blank Page */}

            {/* Pages */}

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
