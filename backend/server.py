import datetime
from flask import Flask, render_template, request
from flask_cors import CORS
import data.db as db
import tools.util as util

# Get the logger
logger = util.init_logger()

# Initialize the server
app = Flask(__name__, template_folder="./templates")
CORS(app)


# -------------- Routes --------------
@app.route("/")
def hello_team():
    return render_template("index.html", utc_dt=datetime.datetime.utcnow())


# Household creation endpoint
@app.route("/create_household", methods=["POST"])
def create_household():
    # Retrieve object from the frontend
    household = request.get_json()

    # Save to the database...
    response = db.save_household(household)
    return response


# Household listing endpoint
@app.route("/list_households", methods=["GET"])
def list_households():
    # Read households from the db
    households = db.list_households()
    return households


# Appliance creation endpoint
@app.route("/create_appliance", methods=["POST"])
def create_appliance():
    # Retrieve object from the frontend
    appliance = request.get_json()

    # Save to the database...
    response = db.save_appliance(appliance)
    return response


# Appliance listing endpoint
@app.route("/list_appliances", methods=["POST"])
def list_appliances():
    # Retrieve email from the frontend
    list_request = request.get_json()

    # Read households from the db
    appliances = db.list_appliances(list_request)
    return appliances


# Appliance deletion endpoint
@app.route("/delete_appliance", methods=["POST"])
def delete_appliance():
    # Retrieve request object from the frontend
    delete_request = request.get_json()

    # Delete from the database...
    response = db.delete_appliance(delete_request)
    return response


# Power Generator creation endpoint
@app.route("/create_power_generator", methods=["POST"])
def create_power_generator():
    # Retrieve object from the frontend
    power_generator = request.get_json()

    # Save to the database...
    response = db.save_power_generator(power_generator)
    return response


# Power Generator listing endpoint
@app.route("/list_power_generators", methods=["POST"])
def list_power_generators():
    # Retrieve object from the frontend
    list_request = request.get_json()

    # Read households from the db
    power_generators = db.list_power_generators(list_request)
    return power_generators


# Power Generator deletion endpoint
@app.route("/delete_power_generator", methods=["POST"])
def delete_power_generator():
    # Retrieve object from the frontend
    delete_request = request.get_json()

    # Delete from the database...
    response = db.delete_power_generator(delete_request)
    return response


# Manufacturer listing endpoint
@app.route("/list_manufacturers", methods=["GET"])
def list_manufacturers():
    # Read manufacturers from the db
    manufacturers = db.list_manufacturers()
    return manufacturers


# -------------- Report Routes --------------


@app.route("/top_twenty_five_manufacturers", methods=["GET"])
def top_twenty_five_manufacturers():
    response = db.get_single_query_report("top_twenty_five_manufacturers")
    return response


@app.route("/manufacturer_appliance_count_by_type", methods=["POST"])
def manufacturer_appliance_count_by_type():
    json = request.get_json()
    response = db.get_single_query_report(
        "manufacturer_appliance_count_by_type", (json["manufacturer_name"],)
    )
    return response


@app.route("/manufacturer_model_search", methods=["POST"])
def manufacturer_model_search():
    json = request.get_json()
    response = db.get_single_query_report(
        "manufacturer_model_search", parameters=([json["search_string"]] * 6)
    )
    return response


@app.route("/heating_cooling_method", methods=["GET"])
def heating_cooling_method():
    queries = {
        "heating_cooling_method_ac": None,
        "heating_cooling_method_heater": None,
        "heating_cooling_method_heat_pump": None,
    }

    report = db.get_multi_queries_report(queries)
    return report


@app.route("/water_heater_statistics_by_states", methods=["GET"])
def water_heater_statistics_by_states():
    report = db.get_single_query_report("water_heater_statistics_by_states")
    return report


@app.route("/water_heater_statistics_drilldown", methods=["POST"])
def water_heater_statistics_drilldown():
    json = request.get_json()
    report = db.get_single_query_report(
        "water_heater_statistics_drilldown", parameters=(json["state"],)
    )
    return report


@app.route("/off_the_grid_household_dashboard", methods=["GET"])
def off_grid_household_dashboard():
    queries = {
        "off_the_grid_dashboard_state": None,
        "off_the_grid_dashboard_avg_storage_capacity": None,
        "off_the_grid_dashboard_power_generation_type": None,
        "off_the_grid_dashboard_on_or_off_grid": None,
        "off_the_grid_dashboard_btu": None,
    }

    report = db.get_multi_queries_report(queries)
    return report


@app.route("/valid_postal_code", methods=["POST"])
def valid_postal_code():
    json = request.get_json()
    return db.validate_postal_code(json["postal_code"])


@app.route("/household_averages_by_radius", methods=["POST"])
def household_averages_by_radius():
    json = request.get_json()
    report = db.get_single_query_report(
        "household_averages_by_radius", [json["postal_code"], json["radius"]] * 2
    )
    return report


if __name__ == "__main__":
    app.run(host="0.0.0.0")
