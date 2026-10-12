import axios from "axios";

export interface GeoLocationResult {
  lat?: number;
  lng?: number;
}

export const getCoordinatesFromAddress = async (
  line: string,
  ward: string,
  district: string,
  city: string,
): Promise<GeoLocationResult> => {
  const fetchLocalGeocoding = async (queryAddress: string) => {
    try {
      const response = await axios.get("/api/geocoding", {
        params: { q: queryAddress },
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
        };
      }
    } catch (err) {
      console.warn(`Lỗi geocoding với chuỗi: "${queryAddress}"`, err);
    }
    return null;
  };

  const clean = (text: string) => (text ? text.trim() : "");

  const cLine = clean(line);
  const cWard = clean(ward);
  const cDistrict = clean(district);
  const cCity = clean(city);

  const fullAddress = [cLine, cWard, cDistrict, cCity, "Việt Nam"]
    .filter(Boolean)
    .join(", ");

  console.log("[Cấp 1] Tìm chi tiết:", fullAddress);
  let coords = await fetchLocalGeocoding(fullAddress);

  if (!coords && (cWard || cDistrict)) {
    const wardDistrictAddress = [cWard, cDistrict, cCity, "Việt Nam"]
      .filter(Boolean)
      .join(", ");

    console.warn(" [Cấp 2] Tìm theo Phường/Xã/Thành phố:", wardDistrictAddress);
    coords = await fetchLocalGeocoding(wardDistrictAddress);
  }

  if (!coords && cDistrict) {
    const districtAddress = [cDistrict, cCity, "Việt Nam"]
      .filter(Boolean)
      .join(", ");

    console.warn(" [Cấp 3] Tìm theo Quận/Huyện:", districtAddress);
    coords = await fetchLocalGeocoding(districtAddress);
  }

  if (!coords && cCity) {
    const cityAddress = [cCity, "Việt Nam"].filter(Boolean).join(", ");

    console.warn("[Cấp 4] Tìm theo Tỉnh/Thành phố:", cityAddress);
    coords = await fetchLocalGeocoding(cityAddress);
  }

  if (coords) {
    console.log("Lấy tọa độ thành công:", coords);
    return coords;
  }

  console.error(
    " Không thể lấy tọa độ từ địa chỉ, sử dụng tọa độ mặc định HaUI",
  );
  return { lat: 21.0537, lng: 105.7351 };
};
