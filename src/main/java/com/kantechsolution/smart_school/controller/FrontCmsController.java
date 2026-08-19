package com.kantechsolution.smart_school.controller;

import com.kantechsolution.smart_school.service.FrontCmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Controller
@RequiredArgsConstructor
public class FrontCmsController {

    private final FrontCmsService frontCmsService;

    @GetMapping("/admin/front/gallery")
    public String galleryPage() { return "front-cms-gallery"; }

    @GetMapping("/admin/front/news")
    public String newsPage() { return "front-cms-news"; }

    @GetMapping("/admin/front/media")
    public String mediaPage() { return "front-cms-media"; }

    @GetMapping("/admin/front/pages")
    public String pagesPage() { return "front-cms-pages"; }

    @GetMapping("/admin/front/menus")
    public String menusPage() { return "front-cms-menus"; }

    @GetMapping("/admin/front/banner")
    public String bannerPage() { return "front-cms-banner"; }

    @GetMapping("/api/front/media")
    @ResponseBody
    public ResponseEntity<?> listMedia() { return ResponseEntity.ok(frontCmsService.listMedia()); }

    @PostMapping(value = "/api/front/media", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMedia(@RequestParam(value = "file", required = false) MultipartFile file,
                                                           @RequestParam(value = "youtubeUrl", required = false) String youtubeUrl) {
        return wrap("Media uploaded successfully!", HttpStatus.CREATED, () -> frontCmsService.saveMedia(file, youtubeUrl));
    }

    @DeleteMapping("/api/front/media/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteMedia(@PathVariable Long id) {
        return wrap("Media deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteMedia(id);
            return Map.of();
        });
    }

    @PostMapping("/api/front/editor-media")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> editorMedia(@RequestParam("file") MultipartFile file) {
        return wrap("Media uploaded successfully!", HttpStatus.OK, () -> frontCmsService.storeEditorMedia(file));
    }

    @GetMapping("/api/front/galleries")
    @ResponseBody
    public ResponseEntity<?> listGalleries() { return ResponseEntity.ok(frontCmsService.listGalleries()); }

    @PostMapping("/api/front/galleries")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createGallery(@RequestBody Map<String, Object> body) {
        return wrap("Gallery saved successfully!", HttpStatus.CREATED, () -> frontCmsService.saveGallery(null, body));
    }

    @PutMapping("/api/front/galleries/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateGallery(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("Gallery updated successfully!", HttpStatus.OK, () -> frontCmsService.saveGallery(id, body));
    }

    @PostMapping("/api/front/galleries/{id}/image")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> galleryImage(@PathVariable Long id,
                                                            @RequestParam("file") MultipartFile file,
                                                            @RequestParam(value = "featured", defaultValue = "false") boolean featured) {
        return wrap("Image uploaded successfully!", HttpStatus.OK, () -> frontCmsService.storeGalleryImage(id, file, featured));
    }

    @DeleteMapping("/api/front/galleries/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteGallery(@PathVariable Long id) {
        return wrap("Gallery deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteGallery(id);
            return Map.of();
        });
    }

    @GetMapping("/api/front/news")
    @ResponseBody
    public ResponseEntity<?> listNews() { return ResponseEntity.ok(frontCmsService.listNews()); }

    @PostMapping("/api/front/news")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createNews(@RequestBody Map<String, Object> body) {
        return wrap("News saved successfully!", HttpStatus.CREATED, () -> frontCmsService.saveNews(null, body));
    }

    @PutMapping("/api/front/news/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateNews(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("News updated successfully!", HttpStatus.OK, () -> frontCmsService.saveNews(id, body));
    }

    @PostMapping("/api/front/news/{id}/image")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> newsImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return wrap("Image uploaded successfully!", HttpStatus.OK, () -> frontCmsService.storeNewsImage(id, file));
    }

    @DeleteMapping("/api/front/news/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteNews(@PathVariable Long id) {
        return wrap("News deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteNews(id);
            return Map.of();
        });
    }

    @GetMapping("/api/front/pages")
    @ResponseBody
    public ResponseEntity<?> listPages() { return ResponseEntity.ok(frontCmsService.listPages()); }

    @PostMapping("/api/front/pages")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createPage(@RequestBody Map<String, Object> body) {
        return wrap("Page saved successfully!", HttpStatus.CREATED, () -> frontCmsService.savePage(null, body));
    }

    @PutMapping("/api/front/pages/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updatePage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("Page updated successfully!", HttpStatus.OK, () -> frontCmsService.savePage(id, body));
    }

    @PostMapping("/api/front/pages/{id}/image")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> pageImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return wrap("Image uploaded successfully!", HttpStatus.OK, () -> frontCmsService.storePageImage(id, file));
    }

    @DeleteMapping("/api/front/pages/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deletePage(@PathVariable Long id) {
        return wrap("Page deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deletePage(id);
            return Map.of();
        });
    }

    @GetMapping("/api/front/menus")
    @ResponseBody
    public ResponseEntity<?> listMenus() { return ResponseEntity.ok(frontCmsService.listMenus()); }

    @PostMapping("/api/front/menus")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMenu(@RequestBody Map<String, Object> body) {
        return wrap("Menu saved successfully!", HttpStatus.CREATED, () -> frontCmsService.saveMenu(null, body));
    }

    @PutMapping("/api/front/menus/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMenu(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("Menu updated successfully!", HttpStatus.OK, () -> frontCmsService.saveMenu(id, body));
    }

    @DeleteMapping("/api/front/menus/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteMenu(@PathVariable Long id) {
        return wrap("Menu deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteMenu(id);
            return Map.of();
        });
    }

    @GetMapping("/api/front/menus/{menuId}/items")
    @ResponseBody
    public ResponseEntity<?> listMenuItems(@PathVariable Long menuId) {
        return ResponseEntity.ok(frontCmsService.listMenuItems(menuId));
    }

    @PostMapping("/api/front/menu-items")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMenuItem(@RequestBody Map<String, Object> body) {
        return wrap("Menu item saved successfully!", HttpStatus.CREATED, () -> frontCmsService.saveMenuItem(null, body));
    }

    @PutMapping("/api/front/menu-items/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMenuItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("Menu item updated successfully!", HttpStatus.OK, () -> frontCmsService.saveMenuItem(id, body));
    }

    @PostMapping("/api/front/menu-items/{id}/move")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> moveMenuItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return wrap("Menu item order updated!", HttpStatus.OK, () -> {
            frontCmsService.moveMenuItem(id, String.valueOf(body.getOrDefault("direction", "")));
            return Map.of();
        });
    }

    @PostMapping("/api/front/menus/{menuId}/items/reorder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> reorderMenuItems(@PathVariable Long menuId, @RequestBody Map<String, Object> body) {
        return wrap("Menu order updated!", HttpStatus.OK, () -> {
            frontCmsService.reorderMenuItems(menuId, body);
            return Map.of();
        });
    }

    @DeleteMapping("/api/front/menu-items/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteMenuItem(@PathVariable Long id) {
        return wrap("Menu item deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteMenuItem(id);
            return Map.of();
        });
    }

    @GetMapping("/api/front/banners")
    @ResponseBody
    public ResponseEntity<?> listBanners() { return ResponseEntity.ok(frontCmsService.listBanners()); }

    @PostMapping("/api/front/banners")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createBanner(@RequestBody Map<String, Object> body) {
        return wrap("Banner image added successfully!", HttpStatus.CREATED, () -> frontCmsService.saveBanners(body));
    }

    @DeleteMapping("/api/front/banners/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteBanner(@PathVariable Long id) {
        return wrap("Banner image deleted successfully!", HttpStatus.OK, () -> {
            frontCmsService.deleteBanner(id);
            return Map.of();
        });
    }

    private ResponseEntity<Map<String, Object>> wrap(String message, HttpStatus status, Supplier<Map<String, Object>> action) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> data = action.get();
            response.put("success", true);
            response.put("message", message);
            response.put("data", data);
            return ResponseEntity.status(status).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
