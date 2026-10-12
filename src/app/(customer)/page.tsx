import HomeSlider from "../../components/ui/HomeSlider";
import Banner from "../../components/ui/Banner";
import CategoryList from "../../components/common/CategoryList";
import PromotionalProducts from "../../components/home/PromotionalProducts";
import DailyFreshProducts from "../../components/home/DailyFreshProducts";
export default function Home() {
  return (
    <>
      <div className="pb-12 space-y-6">
        <HomeSlider />

        <Banner />

        <CategoryList />

        <PromotionalProducts />

        <DailyFreshProducts />
      </div>
    </>
  );
}
