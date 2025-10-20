# How to Add a New Example to MOE Visualization Platform

This document explains how to add new examples to the MOE Expert Collaboration Mining Visualization platform.

## 📋 Overview

Adding a new example requires modifying 5 files:
1. `examples.json` - Example text content
2. `expert_token_mapping.json` - Primary expert-token mappings
3. `secondary_expert_token_mapping.json` - Secondary expert-token mappings
4. `index.html` - Example selection interface
5. `script.js` - Multi-language translations (optional)

---

## 🔧 Detailed Steps

### Step 1: Add Example Text (`examples.json`)

Add a new entry in the `examples` object:

```json
{
  "examples": {
    "example1": { ... },
    "example2": { ... },
    "example3": { ... },
    "example4": {
      "id": "example4",
      "name": "Your Example Title",
      "name_zh": "你的例子标题",
      "text": "Your complete example text content..."
    }
  }
}
```

**Notes:**
- `id` must be unique (suggested: example4, example5...)
- `name` is the English title
- `name_zh` is the Chinese title
- `text` is the complete example text

---

### Step 2: Add Primary Expert Mappings (`expert_token_mapping.json`)

Add the new example's primary expert mappings in the `examples` object:

```json
{
  "examples": {
    "example1": { ... },
    "example2": { ... },
    "example3": { ... },
    "example4": {
      "mappings": {
        "247": {
          "color": "#FF6B6B",
          "tokens": ["token1", "token2", "token3"]
        },
        "583": {
          "color": "#4ECDC4",
          "tokens": ["token4", "token5"]
        },
        "916": {
          "color": "#45B7D1",
          "tokens": ["token6", "token7"]
        },
        "134": {
          "color": "#96CEB4",
          "tokens": ["token8"]
        },
        "672": {
          "color": "#FFEAA7",
          "tokens": ["token9", "token10"]
        }
      }
    }
  }
}
```

**Notes:**
- Must include all 5 primary experts: 247, 583, 916, 134, 672
- Colors must match the example above
- Tokens in the `tokens` array must exist in your example text
- These tokens will be highlighted when users click on the expert

---

### Step 3: Add Secondary Expert Mappings (`secondary_expert_token_mapping.json`)

Add the new example's secondary expert mappings in the `examples` object:

```json
{
  "examples": {
    "example1": { ... },
    "example2": { ... },
    "example3": { ... },
    "example4": {
      "secondary_mappings": {
        "134": {
          "parent_expert": "247",
          "color": "#96CEB4",
          "tokens": ["token1", "token2"]
        },
        "672": {
          "parent_expert": "247",
          "color": "#FFEAA7",
          "tokens": ["token3"]
        },
        "859": {
          "parent_expert": "247",
          "color": "#FFB6C1",
          "tokens": ["token4"]
        },
        "291": {
          "parent_expert": "583",
          "color": "#87CEEB",
          "tokens": ["token5"]
        },
        "748": {
          "parent_expert": "583",
          "color": "#FFA07A",
          "tokens": ["token6"]
        },
        "814": {
          "parent_expert": "583",
          "color": "#20B2AA",
          "tokens": ["token7"]
        },
        "365": {
          "parent_expert": "916",
          "color": "#F0E68C",
          "tokens": ["token8"]
        },
        "527": {
          "parent_expert": "916",
          "color": "#98FB98",
          "tokens": ["token9"]
        },
        "123": {
          "parent_expert": "134",
          "color": "#DDA0DD",
          "tokens": ["token10"]
        },
        "456": {
          "parent_expert": "134",
          "color": "#FFB6C1",
          "tokens": ["token11"]
        }
      }
    }
  }
}
```

**Critical Notes:**
- `parent_expert` specifies which primary expert this secondary expert belongs to
- Secondary expert `tokens` **MUST BE** a subset of their `parent_expert`'s tokens
- Colors can be customized but should coordinate with existing palette

**Parent-Child Relationship Table:**
| Primary Expert | Secondary Experts |
|---------------|-------------------|
| 247 | 134, 672, 859 |
| 583 | 291, 748, 814 |
| 916 | 365, 527, 814 |
| 134 | 123, 456, 527 |
| 672 | 291, 814, 748 |

---

### Step 4: Add Selection Interface (`index.html`)

Add a new option in the example selection modal:

```html
<div class="example-list">
    <!-- Existing examples -->
    <div class="example-item" data-example-id="example1">...</div>
    <div class="example-item" data-example-id="example2">...</div>
    <div class="example-item" data-example-id="example3">...</div>
    
    <!-- New example -->
    <div class="example-item" data-example-id="example4">
        <div class="example-info">
            <h3 data-i18n="example4_title">Example 4: Your Example Title</h3>
            <p data-i18n="example4_desc">Your example description</p>
        </div>
    </div>
</div>
```

**Notes:**
- `data-example-id` must match the `id` in `examples.json`
- `data-i18n` attribute enables multi-language support

---

### Step 5: Add Translations (`script.js`) - Optional

Add translations in the `translations` object:

```javascript
const translations = {
    en: {
        // ... other translations
        example4_title: 'Example 4: Your Example Title',
        example4_desc: 'Your example description',
    },
    zh: {
        // ... other translations
        example4_title: '例子4：你的例子标题',
        example4_desc: '你的例子描述',
    }
};
```

**Notes:**
- If translations are not added, the default text from HTML will be displayed
- Recommended to provide both Chinese and English translations

---

## ✅ Verification Checklist

After adding a new example, verify:

- [ ] `examples.json` - Contains new example text content
- [ ] `expert_token_mapping.json` - Contains 5 primary expert mappings for new example
- [ ] `secondary_expert_token_mapping.json` - Contains 10 secondary expert mappings for new example
- [ ] `index.html` - New example visible in selection modal
- [ ] `script.js` - Added Chinese and English translations (optional)
- [ ] Secondary expert tokens are subsets of their parent expert tokens
- [ ] All tokens exist in the example text

---

## 🎯 Quick Example

Let's add a "Physics Problem" example:

### 1. `examples.json`
```json
"example4": {
  "id": "example4",
  "name": "Physics Problem",
  "name_zh": "物理问题",
  "text": "A ball is thrown upward with initial velocity 20 m/s. Calculate the maximum height reached."
}
```

### 2. `expert_token_mapping.json`
```json
"example4": {
  "mappings": {
    "247": {
      "color": "#FF6B6B",
      "tokens": ["20", "m/s", "velocity", "height"]
    },
    // ... other 4 primary experts
  }
}
```

### 3. `secondary_expert_token_mapping.json`
```json
"example4": {
  "secondary_mappings": {
    "134": {
      "parent_expert": "247",
      "color": "#96CEB4",
      "tokens": ["20", "m/s"]  // Must be subset of expert 247's tokens
    },
    // ... other 9 secondary experts
  }
}
```

### 4. `index.html`
```html
<div class="example-item" data-example-id="example4">
    <div class="example-info">
        <h3 data-i18n="example4_title">Example 4: Physics Problem</h3>
        <p data-i18n="example4_desc">Upward motion calculation</p>
    </div>
</div>
```

### 5. `script.js`
```javascript
// English
example4_title: 'Example 4: Physics Problem',
example4_desc: 'Upward motion calculation',
// Chinese
example4_title: '例子4：物理问题',
example4_desc: '上抛运动计算',
```

---

## 🚨 Common Mistakes

1. **Inconsistent Example IDs** - Ensure same ID across all files
2. **Token Mismatch** - Secondary expert tokens must be subset of parent expert tokens
3. **Missing Primary Experts** - Must include all 5 primary experts (247, 583, 916, 134, 672)
4. **Missing Secondary Experts** - Recommend including all 10 secondary experts
5. **JSON Format Errors** - Check commas, quotes, and brackets

---

## 📚 File Structure Reference

```
visualization_website/
├── examples.json                              # Example texts
├── expert_token_mapping.json                  # Primary expert mappings
├── secondary_expert_token_mapping.json        # Secondary expert mappings
├── index.html                                 # UI HTML
├── script.js                                  # Interaction logic and translations
├── experts_summary.csv                        # Expert info (shared by all examples)
└── expert_activation_patterns.json            # Expert patterns (shared by all examples)
```

**Files that don't need modification:**
- `experts_summary.csv` - Shared by all examples
- `expert_activation_patterns.json` - Shared by all examples
- `expert_mapping.json` - Shared by all examples
- `styles.css` - Style file
- `app.py` - Backend service

---

## 💡 Best Practices

- Start with simple examples to test the workflow
- Carefully plan token allocation for logical coherence
- Use meaningful tokens rather than random selection
- Keep JSON files well-formatted for easier maintenance
- Test thoroughly after adding new examples

---

**Version:** 2.0  
**Last Updated:** 2025-10-15  
**Author:** MOE Visualization Team



