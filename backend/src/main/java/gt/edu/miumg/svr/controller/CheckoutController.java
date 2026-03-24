package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.CheckoutDtos;
import gt.edu.miumg.svr.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/checkout")
    public CheckoutDtos.CheckoutResponse checkout(@Valid @RequestBody CheckoutDtos.CheckoutRequest req) {
        return checkoutService.checkout(req);
    }
}

