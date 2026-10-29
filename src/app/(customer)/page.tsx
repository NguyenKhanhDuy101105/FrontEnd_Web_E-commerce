import HomeSlider from "../../components/ui/HomeSlider";
import Banner from "../../components/ui/Banner";
import CategoryList from "../../components/common/CategoryList";
import PromotionalProducts from "../../components/home/PromotionalProducts";
import DailyFreshProducts from "../../components/home/DailyFreshProducts";
import CategoryShowcase from "../../components/common/CategoryShowcase";
import SpicesPartyProducts from "../../components/home/SpicesPartyProducts";
import VoucherShowcase from "../../components/home/VoucherShowcase";

export default function Home() {
  return (
    <>
      <div className="pb-24 lg:pb-12 space-y-6">
        <HomeSlider />

        <Banner />

        <CategoryList />

        <PromotionalProducts />

        <DailyFreshProducts />

        <CategoryShowcase />

        <SpicesPartyProducts />

        <VoucherShowcase />
      </div>
    </>
  );
}
