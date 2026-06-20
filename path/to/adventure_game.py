import random

def main():
    print("Welcome to the Adventure Game!")
    name = input("What is your name? ")
    print(f"Hello, {name}! Let's embark on an exciting journey.")

    # Define some locations and items
    locations = {
        "start": {"description": "You are at a crossroads. Where do you want to go?", "options": ["left", "right"]},
        "left": {"description": "You have arrived at a forest. Do you want to explore or turn back?", "options": ["explore", "turn_back"]},
        "right": {"description": "You have reached a river. Do you want to cross it or go back?", "options": ["cross", "go_back"]}
    }

    items = {
        "sword": {"description": "A sharp sword for defense."},
        "potion": {"description": "A healing potion that can restore your health."}
    }

    # Start the game
    current_location = "start"
    inventory = []

    while True:
        print(f"\nYou are in {locations[current_location]['description']}")
        if locations[current_location].get("options"):
            for i, option in enumerate(locations[current_location]["options"], 1):
                print(f"{i}. {option}")

        choice = input("What do you want to do? ")

        if choice.isdigit():
            choice_index = int(choice) - 1
            if 0 <= choice_index < len(locations[current_location]["options"]):
                next_location = locations[current_location]["options"][choice_index]
                if next_location == "explore":
                    print("You have found a hidden treasure chest!")
                    inventory.append(random.choice(list(items.keys())))
                elif next_location == "cross":
                    print("You have successfully crossed the river.")
                elif next_location == "turn_back" or next_location == "go_back":
                    current_location = "start"
            else:
                print("Invalid choice. Please try again.")

        if current_location == "left" and len(inventory) > 0:
            print(f"You found a {inventory[0]}!")
            inventory.remove(inventory[0])

        if current_location == "right" and random.random() < 0.5:
            print("You have encountered a monster! Do you want to fight or run?")
            fight_or_run = input("What do you want to do? ")
            if fight_or_run.lower() == "fight":
                print("You defeated the monster!")
            else:
                print("You ran away safely.")

        if current_location == "start" and len(inventory) > 0:
            print(f"You have collected {len(inventory)} items so far!")

if __name__ == "__main__":
    main()
