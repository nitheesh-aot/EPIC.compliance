"""Render the given template with data."""

import os

from jinja2 import DictLoader, Environment, FileSystemBytecodeCache


# Set up cache directory path
CACHE_DIR = "/tmp/jinja_cache"

# Ensure the cache directory exists
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# Set up Jinja2 with Bytecode Cache
bytecode_cache = FileSystemBytecodeCache(
    directory=CACHE_DIR, pattern="jinja_cache_%s.cache"
)

env = Environment(bytecode_cache=bytecode_cache, trim_blocks=True, lstrip_blocks=True)


def render_template_with_data(
    template_name: str, template_content: str, data: dict
) -> str:
    """
    Render a Jinja2 template with given data, using bytecode caching for efficiency.

    :param template_name: Unique name for the template (used in caching).
    :param template_content: Raw HTML template string.
    :param data: Dictionary containing data to be injected into the template.
    :return: Rendered HTML string.
    """
    # Load template into Jinja2 environment
    template_content = template_content.replace("\n", "")
    env.loader = DictLoader({template_name: template_content})

    # Get the template and render it
    template = env.get_template(template_name)
    return template.render(**data)
