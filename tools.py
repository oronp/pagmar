import pagmar_config


def normalize_numbers(numbers_list: list) -> list:
    min_val = min(numbers_list)
    max_val = max(numbers_list)
    range_val = max_val - min_val

    normalized_numbers = [(x - min_val) / range_val for x in numbers_list]
    return normalized_numbers


def order_emotions_dict(emotions_dict: dict) -> dict:
    return {emotion_key: emotions_dict[emotion_key] for emotion_key in pagmar_config.ORDERED_EMOTIONS_ANGLES}
