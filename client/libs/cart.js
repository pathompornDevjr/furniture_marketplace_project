import { popup } from "./alert-popup";
import { showCartToast, showWarningToast } from "./cart-toast";

export const cartFunc = {
  addProduct: (product, alert = true, pro_number, option, count = 1) => {
    const cartStore = JSON.parse(localStorage.getItem("cart"));
    let data = cartStore || [];
    if (
      data.find(
        (d) =>
          d.pro_id === product.pro_id &&
          d.color === option?.color &&
          d.size === option?.size
      )
    ) {
      let thisPro = data.find(
        (d) =>
          d.pro_id === product.pro_id &&
          d.color === option?.color &&
          d.size === option?.size
      );
      thisPro.count += 1;
      if (thisPro.count > pro_number) {
        thisPro.count = pro_number;
        return showWarningToast("ขออภัย จำนวนสินค้าคงเหลือไม่เพียงพอ");
      }
      const index = data.map((d) => d.pro_id).indexOf(thisPro?.pro_id);
      data.splice(index, 1, thisPro);
    } else {
      const newproduct = [
        {
          ...product,
          count,
          ...option,
        },
      ];
      data.push(newproduct[0]);
    }

    localStorage.setItem("cart", JSON.stringify(data));
    if (alert) {
      showCartToast({ product, option, count });
    }
  },
  minusProduct: (product, option) => {
    const cartStore = JSON.parse(localStorage.getItem("cart"));
    let data = cartStore;
    if (
      data.find(
        (d) =>
          d.pro_id === product.pro_id &&
          d.color === option?.color &&
          d.size === option?.size
      )
    ) {
      let thisPro = data.find(
        (d) =>
          d.pro_id === product.pro_id &&
          d.color === option?.color &&
          d.size === option?.size
      );
      thisPro.count -= 1;
      const index = data.map((d) => d.pro_id).indexOf(thisPro?.pro_id);
      data.splice(index, 1, thisPro);
    }
    data = data.filter((d) => d.count > 0);
    localStorage.setItem("cart", JSON.stringify(data));
  },
  deleteProduct: (id) => {
    const cartStore = JSON.parse(localStorage.getItem("cart"));
    localStorage.setItem(
      "cart",
      JSON.stringify(cartStore.filter((c) => c.pro_id !== id))
    );
  },
  addToCartWithOptions: (product, option, count, pro_number) => {
    const cartStore = JSON.parse(localStorage.getItem("cart"));
    if (!cartStore) {
      const newproduct = [
        {
          ...product,
          count,
          ...option,
        },
      ];
      localStorage.setItem("cart", JSON.stringify(newproduct));
      showCartToast({ product, option, count });
    } else {
      let data = cartStore;
      if (
        data.find(
          (d) =>
            d.pro_id === product.pro_id &&
            d.color === option?.color &&
            d.size === option?.size
        )
      ) {
        let thisPro = data.find(
          (d) =>
            d.pro_id === product.pro_id &&
            d.color === option?.color &&
            d.size === option?.size
        );
        thisPro.count += count || 1;
        if (thisPro.count > pro_number) {
          thisPro.count = pro_number;
          return showWarningToast("ขออภัย จำนวนสินค้าคงเหลือไม่เพียงพอ");
        }
        const index = data.map((d) => d.pro_id).indexOf(thisPro?.pro_id);
        data.splice(index, 1, thisPro);
      } else {
        const newproduct = [
          {
            ...product,
            count,
            ...option,
          },
        ];
        data.push(newproduct[0]);
      }

      localStorage.setItem("cart", JSON.stringify(data));
      showCartToast({ product, option, count });
    }
  },
};
